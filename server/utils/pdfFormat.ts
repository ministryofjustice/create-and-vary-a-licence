export const pdfOptions = {
  marginTop: '0.8',
  marginBottom: '0.7',
  marginLeft: '0.9',
  marginRight: '0.9',
}

const footerStyle = `display: flex; align-items: flex-end; font-size: 8px; width: 100%; padding: 0 60px`
const footerDivStyle = 'width: 90%'
const footerCounterStyle = 'text-align: right; flex-grow: 1;'
const pStyle = 'font-size: 8px; margin: 0; padding: 0'
const redStyle = 'color: red'

export const footerHtml = `
    <div style="${footerStyle}">
        <div style="${footerDivStyle}">
            <p style="${pStyle}">Strictly NO unauthorised disclosure without following the approved disclosure process</p>
            <p style="${pStyle}">Handle as per GPMS | The information contained within this document remains the property of HMPPS</p>
            <p style="${pStyle}">Dispose of as <span style="${redStyle}">OFFICIAL SENSITIVE</span> waste</p>
        </div>
        <div style="${footerCounterStyle}"><span class="pageNumber"></span></div>
    </div>
`
