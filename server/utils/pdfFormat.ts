export const pdfOptions = {
  marginTop: '0.8',
  marginBottom: '0.7',
  marginLeft: '0.9',
  marginRight: '0.9',
}

//  const footerStyle = `display: flex; align-items: flex-end; font-size: 8px; width: 100%; padding: 0 60px`
const footerDivStyle = 'width: 90%'
const footerCounterStyle = 'text-align: right; flex-grow: 1;'
const pStyle = 'font-size: 8px; margin: 0; padding: 0'
const headerFooterStyle =
  'font-family: Arial; font-size: 10px; font-weight: bold; width: 100%; height: 15px; text-align: center; padding: 10px;'

// eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/explicit-module-boundary-types
export function getHeader(data: any): string {
  return `
    <span style="${headerFooterStyle}">
      <table style="width: 100% padding-left: 3px">
        <tr>
        <td>Name: ${data.firstName} ${data.lastName}</td>
        <td>Prison no: ${data.nomsId}</td>
        <td>Date of birth: ${data.dateOfBirth}</td>
        </tr>
      </table>
    </span>
  `
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/explicit-module-boundary-types
export function getFooter(data: any): string {
  return `
    <span style="${headerFooterStyle}">
        <div style="${footerDivStyle}">
            <p style="${pStyle}">Version: ${data.version}</p>
        </div>
        <div style="${footerCounterStyle}">Page <span class="pageNumber"></span> of <span class="totalPages"</div>
    </span>
  `
}
