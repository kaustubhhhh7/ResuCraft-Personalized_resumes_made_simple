export const exportToPDF = async (node, filename = 'resume.pdf') => {
  if (!node) throw new Error('Missing preview element')

  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ])

  const canvas = await html2canvas(node, {
    scale: 2,
    useCORS: true,
  })
  const imgData = canvas.toDataURL('image/png')

  const pdf = new jsPDF('p', 'pt', 'a4')
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()

  const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height)
  const imgWidth = canvas.width * ratio
  const imgHeight = canvas.height * ratio

  const x = (pageWidth - imgWidth) / 2
  const y = (pageHeight - imgHeight) / 2

  pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight)
  pdf.save(filename)
}

