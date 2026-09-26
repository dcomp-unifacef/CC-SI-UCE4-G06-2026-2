import type {
    Request,
    Response,
    NextFunction,
} from "express";

import * as service from "../services/compromissoService";

import type { CreateCompromissoDto } from "../types/compromisso";
import type { UpdateCompromissoDto } from "../types/compromisso";

type CompromissoIdParams = {
    id: string;
};


type CreateCompromissoRequest = Request<
    Record<string, never>,
    unknown,
    CreateCompromissoDto
>;


type UpdateCompromissoRequest = Request<
    CompromissoIdParams,
    unknown,
    UpdateCompromissoDto
>;

export async function retrieveAll(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const compromissos = await service.findAll();


        res.json(compromissos);
    }
    catch (error) {
        next(error);
    }
}

export async function retrieveOne(
    req: Request<CompromissoIdParams>,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const id = Number(req.params.id);


        const compromisso = await service.findById(id);


        res.json(compromisso);
    }
    catch (error) {
        next(error);
    }
}

export async function create(
    req: CreateCompromissoRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const compromisso = await service.create(req.body);


        res.status(201).json(compromisso);
    }
    catch (error) {
        next(error);
    }
}


export async function update(
    req: UpdateCompromissoRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const id = Number(req.params.id);


        const compromisso = await service.update(
            id,
            req.body
        );


        res.json(compromisso);
    }
    catch (error) {
        next(error);
    }
}


export async function remove(
    req: Request<CompromissoIdParams>,
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
