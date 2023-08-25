// eslint-disable-next-line no-unused-vars
import React from "react";
import { useState, useEffect, useRef } from "react";
import "./Cronograma.css"

import { format } from "date-fns";
import es from "date-fns/locale/es";

import html2canvas from "html2canvas";

import registrosConstruccion from "./ConstruccionData";

const Cronograma = () => {
  const [balancesPorTipo, setBalancesPorTipo] = useState({});
  const [registrosCronologicos, setRegistrosCronologicos] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [caja, setCaja] = useState(0);
  const [totalMonto, setTotalMonto] = useState(0);

  const tablaRefCronologica = useRef(null);
  const tablaRefPorTipo = useRef(null);

  function capturarTabla(tabla) {
    const fecha = new Date();
    html2canvas(tabla).then(function (canvas) {
      const pngUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = fecha;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    });
  }

  const formatDate = (dateString) => {
    // Obtenemos la fecha sin considerar la zona horaria
    const date = new Date(dateString + "T00:00:00");
    date.setHours(12); // Ajustamos manualmente la hora para evitar problemas con la zona horaria

    const formattedDate = format(date, "eeee, d 'de' MMM", {
      locale: es,
    });
    return formattedDate;
  };

  // Ordenar los registros cronológicamente al montar el componente
  useEffect(() => {
    const registrosOrdenados = [...registrosConstruccion]
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
      .map((registro) => ({
        ...registro,
        fecha: formatDate(registro.fecha),
      }));

    let balanceGeneral = 0;
    const registrosConBalance = registrosOrdenados.map((registro) => {
      const { tipo, monto } = registro;
      const balance =
        tipo === "material" || tipo === "mano-de-obra"
          ? balanceGeneral - monto
          : balanceGeneral + monto;
      balanceGeneral = balance;
      return { ...registro, balance };
    });
    const totalMonto = registrosCronologicos.reduce(
      (acc, registro) => acc + registro.monto,
      0
    )-30000;//Restar la cooperacion para solo calcular gastos
    setTotalMonto(totalMonto);
    setRegistrosCronologicos(registrosConBalance);
  }, [registrosCronologicos]);


  // Actualizar balances por tipo y balance general al cambiar los registros cronológicos
  useEffect(() => {
    let balanceGeneral = 0;
    const balances = registrosCronologicos.reduce((acc, registro) => {
      const { tipo, monto } = registro;
      if (!acc[tipo]) {
        acc[tipo] = 0;
      }

      if (tipo === "material" || tipo === "mano-de-obra") {
        balanceGeneral -= monto;
        acc[tipo] -= monto;
      } else {
        balanceGeneral += monto;
        acc[tipo] += monto;
      }

      return acc;
    }, {});

    setBalancesPorTipo(balances);
    setCaja(balanceGeneral);
  }, [registrosCronologicos]);


  const formatNumberWithCommas = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  return (
    <div className="container">
      
      <table ref={tablaRefCronologica}>
        <thead>
          <tr>
            <th colSpan={6}>Orden Cronológico</th>
          </tr>
          <tr>
            <th>Fecha</th>
            <th>Tipo</th>
            <th>Descripción</th>
            <th>Monto</th>
            <th>Balance</th>
          </tr>
        </thead>
        <tbody>
          {registrosCronologicos.map((registro, index) => (
            <tr key={index} className={registro.tipo}>
              <td>{registro.fecha}</td>
              <td>{registro.tipo}</td>
              <td>{registro.descripcion}</td>
              <td>{formatNumberWithCommas(registro.monto)}</td>
              <td>{formatNumberWithCommas(registro.balance)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={2}>Total de Gastos: $ {formatNumberWithCommas(totalMonto.toFixed(2))}</td>
            <td colSpan={3}>Entre 6: $ {formatNumberWithCommas((totalMonto/6).toFixed(2))}</td>
          </tr>
        </tfoot>
      </table>

      <button
        className="primary-button"
        onClick={() => capturarTabla(tablaRefCronologica.current)}
      >
        Capturar tabla
      </button>
      <div ref={tablaRefPorTipo}>
        {/* Tablas separadas por tipo y balances */}
        {Object.entries(balancesPorTipo).map(([tipo, balance]) => (
          <div key={tipo}>
            <table>
              <thead>
                <tr>
                  <th colSpan={6}>{tipo.toUpperCase()}</th>
                </tr>
                <tr>
                  <th></th>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th>Descripción</th>
                  <th>Monto</th>
                </tr>
              </thead>
              <tbody>
                {registrosCronologicos
                  .filter((registro) => registro.tipo === tipo)
                  .map((registro, index) => {
                    return (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{registro.fecha}</td>
                        <td>{registro.tipo}</td>
                        <td>{registro.descripcion}</td>
                        <td>$ {formatNumberWithCommas(registro.monto.toFixed(2))}</td>
                      </tr>
                    );
                  })}
              </tbody>
              <tfoot>
                <tr>
                  <td></td>
                  <td colSpan={2}>Balance: $ {formatNumberWithCommas(Math.abs(balance).toFixed(2))}</td>
                  <td colSpan={2}>
                    Entre 6: $ {formatNumberWithCommas((Math.abs(balance) / 6).toFixed(2))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ))}
      </div>
      <button
        className="primary-button"
        onClick={() => capturarTabla(tablaRefPorTipo.current)}
      >
        Capturar tabla
      </button>
    </div>
  );
};

export default Cronograma;
