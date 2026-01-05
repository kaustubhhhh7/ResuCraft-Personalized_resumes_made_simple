export const exportToPDF = async (node, filename = 'resume.pdf') => {
  if (!node) throw new Error('Missing preview element')

  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ])

  // Wait for fonts to be ready
  if (document.fonts) {
    await document.fonts.ready
  }

  // Handle images
  const images = node.querySelectorAll('img')
  await Promise.all(Array.from(images).map(img => {
    if (img.complete) return Promise.resolve()
    return new Promise(resolve => { img.onload = resolve; img.onerror = resolve; })
  }))

  // Create a clean container for the capture
  // We place it in the viewport but behind everything to ensure it renders correctly
  // properly without being "off-screen" which sometimes causes clipping
  const container = document.createElement('div')
  container.style.position = 'fixed'
  container.style.top = '0'
  container.style.left = '0'
  container.style.width = '794px'
  container.style.height = 'auto'
  container.style.zIndex = '-9999'
  container.style.overflow = 'visible'
  container.style.visibility = 'visible' // Must be visible for html2canvas
  document.body.appendChild(container)

  const clone = node.cloneNode(true)
  container.appendChild(clone)

  // Reset styles on the clone to ensure perfect A4 rendering
  clone.style.transform = 'none'
  clone.style.margin = '0'
  clone.style.display = 'block'
  clone.style.position = 'relative'
  clone.style.width = '794px'
  clone.style.minHeight = '1123px'
  clone.style.height = 'auto'
  clone.style.boxShadow = 'none'
  clone.style.borderRadius = '0'
  clone.style.overflow = 'visible'

  // Fix potential text clipping by forcing line-height and rendering
  const textNodes = clone.querySelectorAll('*')
  textNodes.forEach(el => {
    el.style.textRendering = 'geometricPrecision'
  })

  try {
    const canvas = await html2canvas(clone, {
      scale: 3,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      scrollY: -window.scrollY, // Adjust for current scroll position
      windowWidth: 794,
      windowHeight: 1123, // Force A4 height context
      logging: false,
      onclone: (clonedDoc) => {
        const clonedNode = clonedDoc.querySelector('.preview-page')
        if (clonedNode) {
          clonedNode.style.height = 'auto'
          clonedNode.style.minHeight = '1123px'
          clonedNode.style.overflow = 'visible'
        }
      }
    })

    const imgData = canvas.toDataURL('image/jpeg', 1.0)
    const pdf = new jsPDF('p', 'pt', 'a4')
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width

    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight)
    pdf.save(filename)
  } catch (err) {
    console.error('PDF Export Error:', err)
    throw err
  } finally {
    document.body.removeChild(container)
  }
}
