import { describe, expect, it } from 'vitest';
import { generarTemplateOTP } from '../../../utils/emailTemplate.js';

describe('Plantilla de correo OTP', () => {
  it('muestra los seis dígitos, la vigencia y textos de seguridad', () => {
    const html = generarTemplateOTP('828607');
    for (const digito of '828607') expect(html).toContain(`>${digito}</td>`);
    expect(html).toContain('10 minutos');
    expect(html).toContain('No compartas este código');
    expect(html).toContain('TemploGym');
  });

  it('no depende de imágenes remotas y escapa contenido no confiable', () => {
    const html = generarTemplateOTP('<12345');
    expect(html).not.toContain('<img');
    expect(html).not.toContain('https://');
    expect(html).toContain('&lt;');
  });
});
