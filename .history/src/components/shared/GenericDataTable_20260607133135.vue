async function fetchData(first: number, rows: number) {

  const safeFirst = Number(first ?? 0);
  const safeRows = Number(rows ?? 20);

  if (safeRows <= 0 || safeFirst < 0) return;

  const key = `${safeFirst}-${safeRows}`;

  if (loadedRanges.value.has(key)) return;

  loadedRanges.value.add(key);

  try {

    const response = await axios.get(props.endpoint, {
      params: {
        offset: safeFirst,
        limit: safeRows,
        sortField: sortField.value,
        sortOrder: sortOrder.value
      }
    });

    const { totalElements, content } = response.data;

    // 🔥 INIT SOLO UNA VEZ
    if (!initialLoadDone) {
      totalRecords.value = totalElements;
      tableData.value = Array(totalElements).fill(null);
      initialLoadDone = true;
    }

    const safeContent = (content || []).filter((x: any) => x != null);

    safeContent.forEach((item: any, index: number) => {
      tableData.value[safeFirst + index] = item;
    });

    emit('data-loaded', tableData.value, totalElements);

  } catch (e) {
    console.error(e);
  }
}