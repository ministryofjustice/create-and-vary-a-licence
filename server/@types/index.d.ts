/*
 This is used to add a method 'renderPDF' into the Express Response interface.
 It is used and implemented in the server/utils/pdfRefender.ts to render a view as a PDF document.
*/
declare namespace Express {
  interface Response {
    internalRedirect(url: string): void
    renderPDF(view: string, pageData: Record<string, unknown>, options: Record<string, unknown>): void
  }
}
