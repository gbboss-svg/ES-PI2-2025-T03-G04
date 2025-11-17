  /**
   *Desevolvido por:Gabriel Benevides Bosso - R.A:24013653
   *Desevolvido por:Victória Beatriz Nobre Andrade - R.A:25016398
   */

CREATE OR REPLACE TRIGGER trg_auditoria_notas
AFTER UPDATE OF Pontuacao ON Notas
FOR EACH ROW
BEGIN
  INSERT INTO Log_Aud_CNotas (
    DataHora,
    Acao,
    Valor_Antigo,
    Valor_Novo,
    Id_Nota
  )
  VALUES (
    SYSTIMESTAMP,
    'ALTERACAO DE NOTA',
    :OLD.Pontuacao,
    :NEW.Pontuacao,
    :NEW.Id_Nota
  );
END;
