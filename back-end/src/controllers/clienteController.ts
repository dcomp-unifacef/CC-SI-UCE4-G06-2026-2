import type {
    Request,
    Response,
    NextFunction,
} from "express";

import * as service from "../services/clienteService";

import type { CreateClienteDto } from "../types/cliente";
import type { UpdateClienteDto } from "../types/cliente";

type ClienteIdParams = {
    id: string;
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
