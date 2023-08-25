// eslint-disable-next-line no-unused-vars
import React from "react";
import { useState, useRef } from "react";

import { format } from "date-fns";
import es from "date-fns/locale/es";

import "./Faenas.css";
import html2canvas from "html2canvas";

import FAENAS from "./ConstruccionFaenas";
import PagosFaenas from "./PagosFaenas";

const Faenas = () => {
  // eslint-disable-next-line no-unused-vars
  const [caja, setCaja] = useState(0);

  const tablaRefFaenas = useRef(null);

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

    const formattedDate = format(date, "eeee, d 'de' MMMM 'del' yyyy", {
      locale: es,
    });
    return formattedDate;
  };

  // Ordenar los registros cronológicamente al montar el componente

  const getDeuda = (asistencia, pagada) => {
    if (asistencia || pagada) {
      return 0;
    } else {
      return 100;
    }
  };

  // Reducción de FAENAS para obtener faenas y deuda total por nombre
  const faenasYDeudaPorNombre = FAENAS.reduce((acc, faena) => {
    const { nombre, asistencia, pagada } = faena;
    const deuda = getDeuda(asistencia, pagada);
    if (!acc[nombre]) {
      acc[nombre] = {
        faenas: [],
        deudaTotal: 0,
        totalPagado: 0,
      };
    }
    acc[nombre].faenas.push(faena);
    acc[nombre].deudaTotal += deuda;
    acc[nombre].totalPagado += pagada ? 100 : 0;
    return acc;
  }, {});

  // Actualizar balances por tipo y balance general al cambiar los registros cronológicos

  const totalDeudas = Object.values(faenasYDeudaPorNombre).reduce(
    (acc, { deudaTotal }) => acc + deudaTotal,
    0
  );
  // Sumar todas las cantidades de Total Pagado para obtener el total general de pagos
  const totalPagado = Object.values(faenasYDeudaPorNombre).reduce(
    (acc, { totalPagado }) => acc + totalPagado,
    0
  );

  const totalPagadoFaenas = PagosFaenas.reduce(
    (total, item) => total + item.pago,
    0
  );

  const formatNumberWithCommas = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  return (
    <div className="containerFaenas">
      <div ref={tablaRefFaenas}>
        {Object.entries(faenasYDeudaPorNombre).map(
          ([nombre, { faenas, deudaTotal, totalPagado }]) => (
            <div key={nombre}>
              <table className="tabla-faenas">
                <thead>
                  <tr>
                    <th className="encabezados-faenas" colSpan={4}>Faenas - {nombre}</th>
                  </tr>
                  <tr>
                    <th className="encabezados-faenas">Fecha</th>
                    <th className="encabezados-faenas">Asistencia</th>
                    <th className="encabezados-faenas">Pagada</th>
                    <th className="encabezados-faenas">Deuda</th>
                  </tr>
                </thead>
                <tbody>
                  {faenas.map((faena, index) => (
                    <tr key={index}>
                      <td>{formatDate(faena.fecha)}</td>
                      <td
                        style={{
                          backgroundColor: faena.asistencia ? "#7CFF00" : "red",
                        }}
                      >
                        {faena.asistencia ? "Sí" : "No"}
                      </td>
                      <td
                        style={{
                          backgroundColor: faena.pagada
                            ? "#7CFF00"
                            : faena.asistencia
                            ? "#7CFF00"
                            : "red",
                        }}
                      >
                        {faena.pagada ? "$100" : faena.asistencia ? "" : "No"}
                      </td>
                      <td>${getDeuda(faena.asistencia, faena.pagada)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td className="pie-faenas"></td>
                    <td className="pie-faenas" colSpan={2}>Ha pagado ${totalPagado}</td>
                    <td className="pie-faenas">Debe ${deudaTotal}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )
        )}
        <div>
        <table className="tabla-faenas">
          <thead>
          <tr>
              <th className="encabezados-faenas" colSpan={3}>Gastos de Faenas</th>

            </tr>
            <tr>
              <th className="encabezados-faenas">Fecha</th>
              <th className="encabezados-faenas">Nombre</th>
              <th className="encabezados-faenas">Pago</th>
            </tr>
          </thead>
          <tbody>
            {PagosFaenas.map((item, index) => (
              <tr key={index}>
                <td>{item.fecha}</td>
                <td>{item.nombre}</td>
                <td>{item.pago}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td className="pie-faenas" colSpan={2}>Total Gastos Faenas</td>
              <td className="pie-faenas">${totalPagadoFaenas}</td>
            </tr>
          </tfoot>
        </table >
      </div>
        <div>
          <table className="tabla-faenas">
            <thead>
              <tr>
                <th className="encabezados-faenas" colSpan={2}>Totales de Faenas</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Total General de Deudas</td>
                <td>${formatNumberWithCommas(totalDeudas)}</td>
              </tr>
              <tr>
                <td>Total General Pagado</td>
                <td>${totalPagado}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td className="pie-faenas">Total General Faenas</td>
                <td className="pie-faenas">${totalDeudas + totalPagado}</td>
              </tr>
              <tr>
                <td className="pie-faenas-resta">-Total Gastos Faenas</td>
                <td className="pie-faenas-resta">${totalPagadoFaenas}</td>
              </tr>
              <tr>
                <td className="pie-faenas">Quedaría en caja</td>
                <td className="pie-faenas">${(totalDeudas + totalPagado)-totalPagadoFaenas}</td>
              </tr>
              <tr>
                <td className="pie-faenas-resta">-Deudas Faenas</td>
                <td className="pie-faenas-resta">${totalDeudas}</td>
              </tr>
              <tr>
                <td className="pie-faenas">Queda en Caja</td>
                <td className="pie-faenas">${(totalDeudas + totalPagado)-totalPagadoFaenas-totalDeudas}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
      <button
        className="primary-button"
        onClick={() => capturarTabla(tablaRefFaenas.current)}
      >
        Capturar tabla
      </button>

      
    </div>
  );
};

export default Faenas;
