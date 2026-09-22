export { cn } from "cn"

export function isLojaAbertaAgora(loja: any): boolean {
  if (!loja) return false;
  
  const agora = new Date();

  // 1. Verifica Modo Férias / Pausa
  if (loja.em_pausa) {
    if (loja.pausa_fim) {
      const dataFimPausa = new Date(loja.pausa_fim);
      // Se a data atual for menor ou igual à data de fim da pausa, está fechado
      if (agora <= dataFimPausa) {
        return false;
      }
    } else {
      // Se está em pausa sem data de fim, está fechado por tempo indeterminado
      return false;
    }
  }
  
  // 2. Se não usa horário automático, respeita a flag manual
  if (!loja.horario_automatico) {
    return loja.aberta !== false;
  }

  // 3. Verifica dias de funcionamento (Domingo = 0, Sábado = 6)
  if (loja.dias_funcionamento && Array.isArray(loja.dias_funcionamento)) {
    const diaAtual = agora.getDay();
    if (!loja.dias_funcionamento.includes(diaAtual)) {
      return false;
    }
  }

  // 4. Verifica se tem horário preenchido
  if (!loja.hora_abertura || !loja.hora_fechamento) {
    return false;
  }
  
  // Converte pra minutos do dia usando o fuso horário local
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
