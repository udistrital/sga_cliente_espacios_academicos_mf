export const selectsFormPeriodo = [
  // name: formControlName --- options: lista con la que se llena el select
  //--- onChange: metodo que ejecuta cuando hay cambio del select
  {
    name: 'periodo',
    label: 'espacios_academicos.select_periodo_academico',
    icon: 'today',
    options: 'periodos',
    onChange: 'obtenerGruposDeEspacioPorPeriodo',
  },
];

export const gruposContructorTabla = [
  {
    columnDef: 'grupo',
    header: 'espacios_academicos.grupo',
    cell: (grupo: any) => grupo.nombre + ' (Grupo - ' + grupo.grupo + ')',
  },
  {
    columnDef: 'codigo',
    header: 'GLOBAL.codigo',
    cell: (grupo: any) => grupo.codigo,
  },
  {
    columnDef: 'docente',
    header: 'espacios_academicos.docente_asignado',
    cell: (grupo: any) => grupo.docente,
  },
  {
    columnDef: 'acciones',
    header: 'GLOBAL.acciones',
    cell: (grupo: any) => '',
  },
];
