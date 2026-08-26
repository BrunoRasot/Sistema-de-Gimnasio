INSERT INTO "Permiso" ("cargo", "modulo", "ver", "crear", "editar", "eliminar")
SELECT "cargo", 'productos', "ver", "crear", "editar", "eliminar"
FROM "Permiso" WHERE "modulo" = 'inventario'
ON CONFLICT ("cargo", "modulo") DO UPDATE SET
  "ver" = EXCLUDED."ver", "crear" = EXCLUDED."crear",
  "editar" = EXCLUDED."editar", "eliminar" = EXCLUDED."eliminar";
DELETE FROM "Permiso" WHERE "modulo" = 'inventario';
