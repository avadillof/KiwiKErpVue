import { TASK_STATES, formatTaskDate, priorityOf, type TaskDTO } from './taskService';

export async function exportPortalTasksToExcel(tasks: TaskDTO[], contactPkid: number): Promise<number> {
    const contactId = Number(contactPkid);
    if (!Number.isInteger(contactId) || contactId <= 0) throw new Error('Contacto no válido');
    // La exportación usa solo los datos ya autorizados por el portal, sin consultar endpoints internos.
    const personalTasks = tasks.filter((task) =>
        Number(task.contactAuthorPkid) === contactId || Number(task.contactPkid) === contactId
    );
    const rows = personalTasks.map((task) => [
        task.code || '',
        task.name || '',
        TASK_STATES.find((state) => state.value === task.state)?.label ?? task.state,
        priorityOf(task).label,
        task.userName || task.contactName || '',
        formatTaskDate(task.startDate),
        formatTaskDate(task.dueDate),
        Number(task.estimatedHours || 0),
        Number(task.progress || 0) / 100,
        task.overdue ? 'Sí' : 'No',
        Number(task.contactAuthorPkid) === contactId
            ? (Number(task.contactPkid) === contactId ? 'Creada por mí y asignada a mí' : 'Creada por mí')
            : 'Asignada a mí',
        task.contactName || '',
        task.userName || ''
    ]);
    const { default: ExcelJS } = await import('exceljs');
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Tareas');
    sheet.columns = [
        { header: 'Código', width: 18 },
        { header: 'Tarea', width: 55 },
        { header: 'Estado', width: 20 },
        { header: 'Prioridad', width: 14 },
        { header: 'Asignada a', width: 30 },
        { header: 'Inicio', width: 16 },
        { header: 'Vencimiento', width: 16 },
        { header: 'Horas previstas', width: 18 },
        { header: 'Progreso', width: 14 },
        { header: 'Vencida', width: 12 },
        { header: 'Relación conmigo', width: 32 },
        { header: 'Contacto destinatario', width: 32 },
        { header: 'Responsable interno', width: 32 }
    ];
    sheet.addRows(rows);
    sheet.getColumn(8).numFmt = '#,##0.00';
    sheet.getColumn(9).numFmt = '0%';
    sheet.getRow(1).font = { bold: true, color: { argb: 'FF24321A' } };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF9CC10A' } };
    sheet.views = [{ state: 'frozen', ySplit: 1 }];
    sheet.autoFilter = 'A1:M1';
    const buffer = await workbook.xlsx.writeBuffer();
    const url = URL.createObjectURL(new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `Tareas_CRM_${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return rows.length;
}
