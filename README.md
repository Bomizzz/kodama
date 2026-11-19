# Kodama

Abra index.html para probar el acceso local. Ambas cuentas de demostración usan 1234. En sitios publicados la demostración está desactivada.

| Rol | Correo |
| --- | --- |
| Administradora | admin@kodama.test |
| Usuario | usuario@kodama.test |

## Activación con Supabase

1. Aplique la migración incluida a un proyecto de Supabase. Crea perfiles con acceso de lectura limitado al propio titular y roles gestionados desde el servidor.
2. Cree la cuenta inicial de administración en Authentication → Users con su correo y una contraseña robusta. Asígnele el rol con la siguiente consulta, sustituyendo el UUID por el de esa cuenta.

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"kodama_role":"admin"}'::jsonb
where id = '00000000-0000-0000-0000-000000000000';
```

3. Despliegue la función kodama-create-user. Configure KODAMA_ORIGIN con el origen HTTPS exacto del frontend, sin barra final. Si se desactiva la verificación JWT del gateway para esta función, la función valida igualmente el token con Supabase Auth y comprueba el rol en la base de datos.
4. Cambie demo a false en config.js y configure la URL y la clave publicable del proyecto. Publique index.html y config.js en el origen anterior. Mantenga las claves privilegiadas en Supabase.
5. Entre con la cuenta de administración y cree las cuentas de usuario desde el panel. La función crea los perfiles automáticamente y exige contraseñas de al menos 12 caracteres.

Esta entrega es una base web independiente del archivo de MIT App Inventor.

## Referencias de interfaz
USWDS y Headless UI sirvieron como referencia para etiquetas visibles, foco de teclado y estados de los controles. La interfaz de Kodama usa HTML y CSS propios.

