import type {
    Request,
    Response,
    NextFunction,
} from "express";

import * as service from "../services/clienteService";

import type { CreateClienteDto } from "../dto/cliente";
import type { UpdateClienteDto } from "../dto/cliente";

import ExcelJS from "exceljs";

type ClienteIdParams = {
    id: string;
};

type ClienteReportQuery = {
    dataInicio?: string;
    dataFim?: string;
};

type CreateClienteRequest = Request<
    Record<string, never>,
    unknown,
    CreateClienteDto
>;


type UpdateClienteRequest = Request<
    ClienteIdParams,
    unknown,
    UpdateClienteDto
>;

function dateForSpreadsheetInSaoPaulo(date: Date) {
    const parts = Object.fromEntries(
        new Intl.DateTimeFormat("en-CA", {
            timeZone: "America/Sao_Paulo",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hourCycle: "h23",
        })
            .formatToParts(date)
            .filter((part) => part.type !== "literal")
            .map((part) => [part.type, Number(part.value)])
    );

    return new Date(Date.UTC(
        parts.year,
        parts.month - 1,
        parts.day,
        parts.hour,
        parts.minute,
        parts.second,
        date.getUTCMilliseconds()
    ));
}

export async function retrieveAll(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const clientes = await service.findAll();


        res.json(clientes);
    }
    catch (error) {
        next(error);
    }
}

export async function downloadReport(
    req: Request<Record<string, never>, unknown, unknown, ClienteReportQuery>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const clientes = await service.findReportByPeriod(
            req.query.dataInicio,
            req.query.dataFim
        );
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Contatos por período");

        worksheet.columns = [
            { header: "ID", key: "idCliente", width: 12 },
            { header: "Razão social / nome", key: "razaoSocialNome", width: 32 },
            { header: "CNPJ/CPF", key: "cnpjCpf", width: 22 },
            { header: "WhatsApp", key: "telefoneWhatsapp", width: 22 },
            { header: "E-mail", key: "email", width: 32 },
            { header: "Ramo de atuação", key: "ramoAtuacao", width: 24 },
            { header: "Origem do contato", key: "origemContato", width: 22 },
            { header: "Observações internas", key: "observacoes", width: 48 },
            { header: "Data de cadastro (Brasília)", key: "criadoEm", width: 30 },
        ];

        worksheet.addRows(clientes.map((cliente) => ({
            ...cliente,
            criadoEm: dateForSpreadsheetInSaoPaulo(new Date(cliente.criadoEm)),
        })));
        worksheet.getRow(1).font = { bold: true };
        worksheet.getColumn("criadoEm").numFmt = "dd/mm/yyyy hh:mm";
        worksheet.views = [{ state: "frozen", ySplit: 1 }];

        const buffer = await workbook.xlsx.writeBuffer();
        const filename = `relatorio_clientes_${req.query.dataInicio}_${req.query.dataFim}.xlsx`;

        res
            .status(200)
            .setHeader(
                "Content-Type",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            )
            .setHeader("Content-Disposition", `attachment; filename="${filename}"`)
            .setHeader("Cache-Control", "no-store")
            .send(Buffer.from(buffer));
    }
    catch (error) {
        next(error);
    }
}

export async function retrieveOne(
    req: Request<ClienteIdParams>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const id = Number(req.params.id);


        const cliente = await service.findById(id);


        res.json(cliente);
    }
    catch (error) {
        next(error);
    }
}

export async function create(
    req: CreateClienteRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const cliente = await service.create(req.body);


        res.status(201).json(cliente);
    }
    catch (error) {
        next(error);
    }
}


export async function update(
    req: UpdateClienteRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const id = Number(req.params.id);


        const cliente = await service.update(
            id,
            req.body
        );


        res.json(cliente);
    }
    catch (error) {
        next(error);
    }
}


export async function remove(
    req: Request<ClienteIdParams>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const id = Number(req.params.id);


        await service.remove(id);


        res.status(204).end();
    }
    catch (error) {
        next(error);
    }
}
