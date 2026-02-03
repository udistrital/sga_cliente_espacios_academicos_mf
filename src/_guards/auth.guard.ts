import { Injectable } from '@angular/core';
import { CanActivate, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { PopUpManager } from 'src/app/managers/popUpManager';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private popUpManager: PopUpManager,
    private translate: TranslateService
  ) {}

  canActivate(_route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): boolean {
    const menuItems = readMenuItemsFromStorage('menu');
    const targetPath = getGlobalPath(); // ✅ Single-SPA safe

    // 1) Aplana URLs permitidas desde el menú (recursivo)
    const allowed = collectAllowedUrls(menuItems);

    // 2) Estrategia de validación:
    // - exacta: permite /ruta exacta
    // - prefijo: permite /ruta y cualquier subruta /ruta/...
    const ok = isAllowed(targetPath, allowed, { allowSubroutes: true });

    if (ok) return true;

    this.popUpManager.showErrorAlert(
      this.translate.instant('ERROR.rol_insuficiente_titulo')
    );
    return false;
  }
}

/** Lee "menu" desde localStorage en JSON plano o base64(JSON). */
function readMenuItemsFromStorage(key: string): any[] {
  const raw = localStorage.getItem(key);
  if (!raw) return [];

  const parsed = tryParseJson(raw) ?? tryParseJson(atobSafe(raw));
  const items = extractMenuItems(parsed);

  return Array.isArray(items) ? items : [];
}

function tryParseJson(s: string | null): any | null {
  if (!s) return null;
  try { return JSON.parse(s); } catch { return null; }
}

function atobSafe(s: string): string | null {
  try { return atob(s); } catch { return null; }
}

/** Soporta menús envueltos: array directo, {Opciones}, {menu}, {data}, etc. */
function extractMenuItems(menu: any): any[] {
  if (!menu) return [];
  if (Array.isArray(menu)) return menu;
  if (Array.isArray(menu?.Opciones)) return menu.Opciones;
  if (Array.isArray(menu?.menu)) return menu.menu;
  if (Array.isArray(menu?.data)) return menu.data;
  if (Array.isArray(menu?.data?.Opciones)) return menu.data.Opciones;
  return [];
}

/**Single-SPA: toma la ruta global real (pathname o hash routing). */
function getGlobalPath(): string {
  const hash = window.location.hash || '';
  if (hash.startsWith('#/')) return normalizePath(hash.slice(1));
  return normalizePath(window.location.pathname || '/');
}

/** Normaliza: quita query/hash/matrix, asegura '/', quita '/' finales. */
function normalizePath(path: string): string {
  let p = (path || '/').split('?')[0].split('#')[0];
  p = p.split(';')[0].trim();
  if (!p.startsWith('/')) p = '/' + p;
  if (p.length > 1) p = p.replace(/\/+$/, '');
  return p;
}

/** Recorre menú y devuelve una lista de URLs normalizadas (solo las que existan). */
function collectAllowedUrls(menuItems: any[]): string[] {
  const out: string[] = [];

  const walk = (items: any[]) => {
    for (const it of items) {
      const url = (it?.Url ?? it?.url ?? '').toString().trim();
      if (url) out.push(normalizePath(url));

      const children = it?.Opciones ?? it?.opciones ?? [];
      if (Array.isArray(children) && children.length) walk(children);
    }
  };

  walk(menuItems);

  // elimina duplicados
  return Array.from(new Set(out));
}

function isAllowed(
  target: string,
  allowedUrls: string[],
  opts: { allowSubroutes: boolean }
): boolean {
  if (!allowedUrls.length) return false;

  // exact match
  if (allowedUrls.includes(target)) return true;

  // prefijo (subrutas)
  if (opts.allowSubroutes) {
    return allowedUrls.some(u => u !== '/' && target.startsWith(u + '/'));
  }

  return false;
}
