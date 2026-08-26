const escaparHtml = (valor: string) =>
  valor.replace(/[&<>'"]/g, (caracter) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[caracter] || caracter);

export const generarTemplateOTP = (codigo: string) => {
  const codigoSeguro = escaparHtml(codigo);
  const digitos = codigoSeguro.split('').map((digito) => `
    <td align="center" width="44" height="54" style="width:44px;height:54px;background:#ffffff;border:1px solid #eadca8;border-radius:9px;color:#171717;font-family:Consolas,'Courier New',monospace;font-size:27px;line-height:54px;font-weight:800;">${digito}</td>
  `).join('<td width="7" style="width:7px;"></td>');

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light">
  <title>Código de acceso TemploGym</title>
  <style>
    body { margin:0; padding:0; background:#f4f5f7; font-family:Arial,'Segoe UI',sans-serif; }
    table { border-collapse:separate; }
    @media only screen and (max-width:520px) {
      .outer { padding:16px 10px !important; }
      .card-pad { padding:28px 18px !important; }
      .code-cell { padding:20px 8px !important; }
      .title { font-size:23px !important; }
    }
  </style>
</head>
<body bgcolor="#f4f5f7">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">Tu código temporal de acceso es ${codigoSeguro}. Vence en 10 minutos.</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#f4f5f7">
    <tr><td class="outer" align="center" style="padding:36px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;max-width:560px;">
        <tr><td align="center" style="padding:0 0 20px;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td align="center" width="38" height="38" bgcolor="#f4c430" style="width:38px;height:38px;border-radius:10px;color:#111111;font-size:20px;font-weight:900;">T</td>
            <td style="padding-left:10px;color:#151515;font-size:20px;font-weight:800;letter-spacing:-0.4px;">Templo<span style="color:#d6a900;">Gym</span></td>
          </tr></table>
        </td></tr>
        <tr><td style="background:#ffffff;border:1px solid #e2e4e8;border-radius:18px;box-shadow:0 8px 30px rgba(18,18,18,.07);overflow:hidden;">
          <div style="height:5px;background:#f4c430;font-size:0;line-height:0;">&nbsp;</div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
            <td class="card-pad" align="center" style="padding:38px 40px 34px;">
              <table role="presentation" cellpadding="0" cellspacing="0"><tr><td align="center" width="54" height="54" bgcolor="#fff8db" style="width:54px;height:54px;border:1px solid #f1d56a;border-radius:27px;color:#b68e00;font-size:25px;line-height:54px;font-weight:bold;">&#128274;</td></tr></table>
              <h1 class="title" style="margin:20px 0 8px;color:#171717;font-size:27px;line-height:1.25;font-weight:800;">Confirma tu inicio de sesión</h1>
              <p style="margin:0 auto 26px;max-width:390px;color:#60646c;font-size:14px;line-height:1.65;">Usa este código para completar el acceso a tu cuenta de TemploGym.</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:400px;background:#fffaf0;border:1px solid #f0d36b;border-radius:14px;"><tr>
                <td class="code-cell" align="center" style="padding:22px 16px;">
                  <p style="margin:0 0 12px;color:#85712b;font-size:10px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;">Código de verificación</p>
                  <table role="presentation" cellpadding="0" cellspacing="0"><tr>${digitos}</tr></table>
                </td>
              </tr></table>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:400px;margin-top:16px;background:#f7f7f8;border-radius:11px;"><tr>
                <td width="42" align="center" style="padding:14px 0 14px 14px;color:#c59b00;font-size:18px;">&#9201;</td>
                <td style="padding:14px;color:#5f636b;font-size:12px;line-height:1.5;">Este código es válido durante <strong style="color:#171717;">10 minutos</strong> y solo puede utilizarse una vez.</td>
              </tr></table>
              <div style="height:1px;background:#eceef1;margin:28px 0 22px;font-size:0;line-height:0;">&nbsp;</div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:400px;"><tr>
                <td width="34" valign="top" style="color:#c59b00;font-size:20px;">&#9888;</td>
                <td align="left" style="color:#777b83;font-size:12px;line-height:1.55;"><strong style="display:block;margin-bottom:3px;color:#252525;font-size:13px;">¿No intentaste iniciar sesión?</strong>No compartas este código. Puedes ignorar el mensaje; nadie podrá acceder sin completarlo.</td>
              </tr></table>
            </td>
          </tr></table>
        </td></tr>
        <tr><td align="center" style="padding:20px 20px 0;color:#91949a;font-size:11px;line-height:1.6;">Mensaje automático de seguridad · No respondas a este correo<br><span style="color:#b28b00;">TemploGym</span> · 2026</td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
};
