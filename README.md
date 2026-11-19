# Kodama

Abra index.html para probar el acceso local. Ambas cuentas de demostración usan 1234. La demostración también está disponible en la vista previa pública de GitHub Pages. Usa cuentas ficticias y no guarda datos en Supabase.

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
4. Cambie demo a false en config.js y configure la URL y la clave publicable del proyecto. Publique index.html, config.js y las imágenes incluidas en el origen anterior. Mantenga las claves privilegiadas en Supabase.
5. Entre con la cuenta de administración y cree las cuentas de usuario desde el panel. La función crea los perfiles automáticamente y exige contraseñas de al menos 12 caracteres.

Esta versión adapta a la web las pantallas y los recursos del proyecto original KODAMA de MIT App Inventor.

## Referencias de interfaz
USWDS y Headless UI sirvieron como referencia para etiquetas visibles, foco de teclado y estados de los controles. La interfaz de Kodama usa HTML y CSS propios.


## Pantallas recuperadas de App Inventor

La versión web incorpora la portada, Inicio, Chat, Perfil y Acerca de con los textos y las imágenes del proyecto KODAMA. El registro dirige a la administradora, según el flujo de cuentas solicitado. Progreso era una pantalla vacía y conserva un estado sin registros. Pago también estaba vacío y no tenía un enlace operativo. Chat conserva el saludo y permite probar escritura y dictado compatible. La vista no conecta con profesionales ni transmite mensajes. Comunidad, Definiciones, Retos y Logros y Evaluaciones conservan sus nombres como secciones sin contenido publicado.



La biblioteca Videos incluye dos recursos en español de YouTube. Sus reproductores se cargan al pulsar Reproducir y cada tarjeta enlaza al video original. El diseño de tarjetas y controles toma como referencia [shadcn/ui](https://github.com/shadcn-ui/ui). El fantasma original se anima con CSS y respeta la preferencia de movimiento reducido.


## Avisos de acceso

Aplique también la migración 202611190002 después de crear los perfiles de Kodama. Cada sesión de usuario registrada desde Kodama genera un aviso único. En el panel de administración se ven los últimos 50 avisos y la lista se actualiza cada 15 segundos mientras está abierta. La demo pública muestra un aviso de ejemplo. El buzón no envía correos ni notificaciones push.
