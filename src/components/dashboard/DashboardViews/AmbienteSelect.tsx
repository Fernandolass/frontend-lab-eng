import React from "react";

interface Ambiente {
  id: number;
  nome_do_ambiente: string;
  categoria: "PRIVATIVA" | "COMUM" | "EXTERNA";
}

interface AmbienteSelectProps {
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  ambientes: Ambiente[];
  className?: string;
}

export const AmbienteSelect: React.FC<AmbienteSelectProps> = ({
  value,
  onChange,
  ambientes,
  className = "form-control",
}) => {
  const ambientesPrivativos = ambientes.filter((a) => a.categoria === "PRIVATIVA");
  const ambientesComuns = ambientes.filter((a) => a.categoria === "COMUM");
  const ambientesExternos = ambientes.filter((a) => a.categoria === "EXTERNA");

  return (
    <select value={value} onChange={onChange} className={className}>
      <option value="">Selecione o ambiente</option>

      {ambientesPrivativos.length > 0 && (
        <optgroup label="Unidades Privativas">
          {ambientesPrivativos.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nome_do_ambiente}
            </option>
          ))}
        </optgroup>
      )}

      {ambientesComuns.length > 0 && (
        <optgroup label="Áreas Comuns">
          {ambientesComuns.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nome_do_ambiente}
            </option>
          ))}
        </optgroup>
      )}

      {ambientesExternos.length > 0 && (
        <optgroup label="Áreas Externas">
          {ambientesExternos.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nome_do_ambiente}
            </option>
          ))}
        </optgroup>
      )}
    </select>
  );
};