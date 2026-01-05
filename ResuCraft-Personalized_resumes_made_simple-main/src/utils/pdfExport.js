export const exportToPDF = async (node, filename = 'resume.pdf') => {
  if (!node) throw new Error('Missing preview element')

  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ])

  // Wait for fonts and images
  if (document.fonts) await document.fonts.ready
  const images = node.querySelectorAll('img')
  await Promise.all(Array.from(images).map(img => {
    if (img.complete) return Promise.resolve()
    return new Promise(resolve => { img.onload = resolve; img.onerror = resolve; })
  }))

  const container = document.createElement('div')
  container.style.position = 'absolute'
  container.style.left = '-9999px'
  container.style.top = '0'
  document.body.appendChild(container)

  const clone = node.cloneNode(true)
  container.appendChild(clone)

  // Ensure the clone is perfectly sized
  clone.style.transform = 'none'
  clone.style.margin = '0'
  clone.style.display = 'block'
  clone.style.width = '794px'
  clone.style.minHeight = '1123px'

  try {
    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      windowWidth: 794,
      onclone: (clonedDoc) => {
        // Just a safety check to remove any leftovers from the real DOM
        const clonedNode = clonedDoc.querySelector('.preview-page')
        if (clonedNode) {
          clonedNode.style.boxShadow = 'none'
          clonedNode.style.transform = 'none'
        }
      }
    })

    const imgData = canvas.toDataURL('image/png', 1.0)
    const pdf = new jsPDF('p', 'pt', 'a4')
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    pdf.save(filename)
  } catch (err) {
    console.error('PDF Export Error:', err)
    throw err
  } finally {
    document.body.removeChild(container)
  }
}
