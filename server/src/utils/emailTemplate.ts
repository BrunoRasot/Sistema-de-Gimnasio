export const generarTemplateOTP = (codigo: string) => {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="color-scheme" content="only light">
      <meta name="supported-color-schemes" content="only light">
      <meta name="x-apple-disable-message-reformatting">
      <style>
        :root { color-scheme: only light; supported-color-schemes: only light; }
        body, table, td { background-color: #0a0a0a !important; }
        @media (prefers-color-scheme: dark) {
          body, table, td { background-color: #0a0a0a !important; }
          h1, p, span, strong, div { color: inherit !important; }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0a0a0a; -webkit-font-smoothing: antialiased;" bgcolor="#0a0a0a">
      
      <!-- Contenedor Principal (Fondo Negro) -->
      <table align="center" cellpadding="0" cellspacing="0" width="100%" bgcolor="#0a0a0a" style="max-width: 600px; margin: 0 auto; background-color: #0a0a0a;">

        <!-- Espacio superior -->
        <tr><td height="40"></td></tr>

        <!-- Logo Superior (El tuyo local) -->
        <tr>
          <td align="center">
            <img src="cid:logo-templogym" alt="TemploGym" style="max-width: 200px; display: block; margin: 0 auto;" />
          </td>
        </tr>

        <!-- Línea Dorada en "V" (chevron brillante) -->
        <tr>
          <td align="center" style="padding-top: 20px;">
            <!--[if mso]>
            <div style="width: 100%; height: 2px; background-color: #ffcc00;"></div>
            <![endif]-->
            <!--[if !mso]><!-->
            <svg width="100%" height="22" viewBox="0 0 600 22" preserveAspectRatio="none" style="display: block; max-width: 600px;">
              <polyline points="0,0 300,22 600,0" fill="none" stroke="#ffcc00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <polyline points="0,0 300,22 600,0" fill="none" stroke="#ffcc00" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" opacity="0.25" />
            </svg>
            <!--<![endif]-->
          </td>
        </tr>

        <!-- Tarjeta Gris Oscuro -->
        <tr>
          <td align="center" style="padding: 40px 20px;">
            <table cellpadding="0" cellspacing="0" width="100%" bgcolor="#141416" style="background-color: #141416; border-radius: 16px; border: 1px solid #27272a; padding: 40px 20px;">

              <!-- Ícono Candado Dorado -->
              <tr>
                <td align="center" style="padding-bottom: 20px;">
                  <div style="width: 64px; height: 64px; border: 2px solid #ffcc00; border-radius: 50%; display: inline-block; background-color: rgba(255, 204, 0, 0.05); box-shadow: 0 0 20px rgba(255, 204, 0, 0.1);">
                    <!-- Cargamos el ícono desde la nube para no saturar tu backend -->
                    <img src="https://img.icons8.com/ios-filled/50/ffcc00/lock.png" alt="Lock" style="width: 32px; height: 32px; display: block; margin: 16px auto 0 auto;" />
                  </div>
                </td>
              </tr>

              <!-- Título -->
              <tr>
                <td align="center" style="padding-bottom: 12px;">
                  <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff;">Verificación de acceso</h1>
                </td>
              </tr>

              <!-- Línea separadora pequeña -->
              <tr>
                <td align="center" style="padding-bottom: 24px;">
                  <div style="width: 40px; height: 3px; background-color: #ffcc00;"></div>
                </td>
              </tr>

              <!-- Texto Descriptivo -->
              <tr>
                <td align="center" style="padding-bottom: 30px;">
                  <p style="margin: 0; font-size: 15px; color: #d4d4d8; line-height: 1.6; max-width: 400px;">
                    Hemos recibido un intento de inicio de sesión en tu cuenta.<br><br>
                    Ingresa el siguiente código en la página que abriste para completar el proceso.
                  </p>
                </td>
              </tr>

              <!-- Caja del Código -->
              <tr>
                <td align="center" style="padding-bottom: 24px;">
                  <table cellpadding="0" cellspacing="0" width="100%" bgcolor="#0a0a0a" style="max-width: 400px; border: 1px solid #ffcc00; border-radius: 12px; background-color: #0a0a0a;">
                    <tr>
                      <td align="center" style="padding: 24px;">
                        <span style="font-size: 46px; font-weight: bold; color: #ffcc00; letter-spacing: 12px; font-family: 'Courier New', Courier, monospace;">
                          ${codigo}
                        </span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Caja del Temporizador -->
              <tr>
                <td align="center" style="padding-bottom: 30px;">
                  <table cellpadding="0" cellspacing="0" width="100%" bgcolor="#1a1a1d" style="max-width: 400px; background-color: #1a1a1d; border-radius: 12px; border: 1px solid #27272a;">
                    <tr>
                      <td width="50" align="center" style="padding: 16px 0 16px 20px;">
                        <img src="https://img.icons8.com/ios-filled/50/ffcc00/clock--v1.png" alt="Clock" style="width: 24px; height: 24px; display: block;" />
                      </td>
                      <td align="left" style="padding: 16px 20px 16px 10px; font-size: 14px; color: #a1a1aa; line-height: 1.5;">
                        Este código expirará en <strong style="color: #ffcc00; font-weight: 600;">10 minutos</strong><br>por tu seguridad.
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Línea Divisora -->
              <tr>
                <td align="center" style="padding-bottom: 24px;">
                  <div style="width: 100%; height: 1px; background-color: #27272a;"></div>
                </td>
              </tr>

              <!-- Sección: ¿No fuiste tú? -->
              <tr>
                <td align="center">
                  <table cellpadding="0" cellspacing="0" width="100%" style="max-width: 400px;">
                    <tr>
                      <td width="40" align="left" valign="top" style="padding-top: 2px;">
                        <img src="https://img.icons8.com/ios/50/ffcc00/security-checked.png" alt="Shield" style="width: 28px; height: 28px; display: block;" />
                      </td>
                      <td align="left" style="font-size: 13px; color: #8a8a93; line-height: 1.5; padding-left: 10px;">
                        <strong style="color: #ffffff; font-size: 14px; display: block; margin-bottom: 4px;">¿No fuiste tú?</strong>
                        Si no intentaste iniciar sesión, ignora este correo.<br>Tu cuenta permanece segura.
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

            </table>
          </td>
        </tr>

        <!-- Footer Copyright -->
        <tr>
          <td align="center" style="padding-bottom: 40px;">
            <p style="margin: 0; font-size: 12px; color: #71717a;">
              &copy; <span style="color: #ffcc00;">2026</span> TemploGym. Todos los derechos reservados.
            </p>
          </td>
        </tr>

      </table>
      
    </body>
    </html>
  `;
};
