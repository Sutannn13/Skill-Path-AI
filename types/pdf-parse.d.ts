declare module 'pdf-parse' {
    interface PdfParseResult {
        numpages: number
        numrender: number
        info: unknown
        metadata: unknown
        text: string
        version: string
    }
    function pdf(
        dataBuffer: Buffer,
        options?: Record<string, unknown>
    ): Promise<PdfParseResult>
    export default pdf
}
