# Integration of Automatic Lembar Disposisi PDF Generation

This plan details how we will integrate the automatic PDF generation feature from `D:\Form Aplikasi\index.html` into the main application at `D:\aplikasi\index.html`.

## Proposed Changes

### 1. Copy Assets
We will copy the `gotham-font.js` file from `D:\Form Aplikasi\` to `D:\aplikasi\` so that it can be loaded by the main application.

### 2. Update `D:\aplikasi\index.html` Dependencies
We will include the necessary scripts in the `<head>` of `index.html`:
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/pdfmake.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/vfs_fonts.js"></script>
<script src="gotham-font.js"></script>
<script src="https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js"></script>
```

### 3. Add PDF Generation Logic
We will embed the PDF layout definition, `logoTVRI` base64 string, and checkbox drawing functions (`getCheckmark`, `drawCheckbox`) into `index.html`.

### 4. Modify `prosesDisposisi()` Function
When the **Kepala Stasiun** clicks "SIMPAN & KIRIM" on the Disposisi modal, the system will now automatically:
1. Fetch the document details from Firestore to populate the PDF fields (Nomor Agenda, Tanggal, Dari, Hal, dll).
2. Generate the "Lembar Disposisi" PDF using `pdfMake` based on the selected *Tujuan*, *Instruksi*, and *Catatan*.
3. Fetch the original Surat PDF attachment (`linkFile`) from Firebase Storage.
4. Merge the generated Lembar Disposisi with the original attachment using `PDFLib`.
5. Upload the merged PDF back to Firebase Storage (`final/...`).
6. Update the Firestore document, setting `linkFile` to the new merged PDF and updating the status directly to `"Selesai Disposisi"`.

> [!TIP]
> This automation will bypass the manual "Upload Lembar Disposisi & TTE" step previously done by the Sekretariat, making the flow much more efficient. 

## User Review Required
> [!WARNING]
> **CORS on Firebase Storage:** Fetching the original PDF from Firebase Storage to merge it might encounter Cross-Origin Resource Sharing (CORS) issues depending on your Firebase Storage configuration. If you haven't enabled CORS for your Firebase Storage bucket, the PDF merge step might fail. 
> *Are you okay with this approach, and do you have CORS configured for your Firebase bucket?* If not, I can provide instructions on how to set it up later.

> [!NOTE]
> **TTE (Tanda Tangan Elektronik):** The auto-generated PDF will have the static signature text as defined in your template (Kepala TVRI Stasiun Jawa Tengah - Sanny Damanik). Since it is generated on the client-side, it will replace the manual TTE upload flow. Is this acceptable for your workflow?

Please review and approve this plan. Once approved, I will proceed with the code modifications.
