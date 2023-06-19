import {Injectable} from '@angular/core';
import {createWorker} from 'tesseract.js';
import {ToastService} from "@app/shared/sabi-components/toast/toast.service";
import {FileUrlModel} from "@app/shared/sabi-components/ocr-uploader/model/FileUrl.model";
import {OcrModel} from "@app/shared/sabi-components/ocr-uploader/model/Ocr.model";
import {LoggerStatusModel} from "@app/shared/sabi-components/ocr-uploader/model/LoggerStatus.model";
import {OCR_CONFIG} from "@core/constant";
import {Observable, of} from "rxjs";
import {fileBase64Model} from "@app/module/ocr/model/fileBase64.model";

@Injectable({
    providedIn: 'root'
})
export class OcrUploaderService {
    loggerStats = new LoggerStatusModel();

    constructor(
        private toastService: ToastService
    ) {
    }

    createFileToBase64 = (file: File[]) => new Promise<fileBase64Model>((resolve, reject) => {
        Array.from(file).forEach((file: File) => {
            const fileReader = new FileReader();
            fileReader.onload = (file: ProgressEvent<FileReader>) => {
                const formatResponse: { data: string | ArrayBuffer | null } = {
                    data: file.target!.result
                }
                resolve(<FileUrlModel>formatResponse);
            };
            fileReader.onerror = (error: ProgressEvent<FileReader>) => reject(error);
            return fileReader.readAsDataURL(file);
        })
    })

    async traceOcrService(filePath: string) {
        try {
            const worker = await createWorker({
                logger: processing => (
                    this.watchProcessLogger(processing)
                )
            });
            await worker.loadLanguage(`${OCR_CONFIG.LANG.EN}`);
            await worker.initialize(`${OCR_CONFIG.LANG.EN}`);
            await worker.recognize(filePath);
            let data: any;
            ({data} = await worker.recognize(filePath));
            this.toastService.success('Success processing extracting data ')
            await worker.terminate();
            console.log(data)
            return new Promise<PromiseLike<OcrModel>>((resolve, reject) => {
                if (data.text.length > 0) {
                    resolve(data);
                } else {
                    const errorMessage = new Error(`Whoops Something when wrong !`);
                    reject(errorMessage);
                }
            })
        } catch {
            this.toastService.error('Failed processing extracting data !');
            return new Error('Whoops internal server error ( 500 )');
        }
    }

    watchProcessLogger(logs: LoggerStatusModel) {
        const setlogger = new LoggerStatusModel();
        setlogger.jobId = logs.jobId;
        setlogger.workerId = logs.workerId;
        setlogger.userJobId = logs.userJobId;
        setlogger.status = logs.status;
        setlogger.progress = logs.progress;
        this.loggerStats = setlogger;
    }

    isLogger(): Observable<LoggerStatusModel> {
        return of(this.loggerStats);
    }

}
