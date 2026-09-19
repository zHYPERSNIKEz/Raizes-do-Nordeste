export { cn } from "cn"

export function isLojaAbertaAgora(loja: any): boolean {
  if (!loja) return false;
  
  // Se não usa horário automático, respeita a flag manual
  if (!loja.horario_automatico) {
    return loja.aberta !== false;
  }

  // Se usa automático mas falta horário, assume fechado
  if (!loja.hora_abertura || !loja.hora_fechamento) {
    return false;
  }

  const agora = new Date();
  
  // Converte pra minutos do dia usando o fuso horário local
  // Nota: Isso roda no Node (Server Actions) ou no browser
  const horas = agora.getHours();
  const minutos = agora.getMinutes();
  const minutosAgora = horas * 60 + minutos;

  const [hAbre, mAbre] = loja.hora_abertura.split(':').map(Number);
  const [hFecha, mFecha] = loja.hora_fechamento.split(':').map(Number);
  
  const minutosAbre = hAbre * 60 + mAbre;
  const minutosFecha = hFecha * 60 + mFecha;

  if (minutosAbre < minutosFecha) {
    // Horário no mesmo dia (ex: 08:00 as 18:00)
    return minutosAgora >= minutosAbre && minutosAgora <= minutosFecha;
  } else {
    // Horário que passa da meia-noite (ex: 18:00 as 02:00)
    return minutosAgora >= minutosAbre || minutosAgora <= minutosFecha;
  }
}
