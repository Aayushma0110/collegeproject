import prisma from '../utils/prisma-clients.js';


const createHistory = async (req, res) => {
    try {
        const body = req.body;

        const history = await prisma.history.create({
            data: {
                patientId: body.patientId,
                doctorId: body.doctorId,
                diagnosis: body.diagnosis,
                treatment: body.treatment,
                visit_date: new Date(body.visit_date),
            }
        });
        res.status(201).json(history);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
const getAllHistories = async (req, res) => {
    try {
        const histories = await prisma.history.findMany({
            include: {
                patient: true,  
                doctor: true    
            }
        });
        res.status(200).json(histories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


const getOneHistory = async (req, res) => {
    try {
        const id = req.params.id;
        const history = await prisma.history.findUnique({
            where: {
                id: parseInt(id)
            },
            include: {
                patient: true,
                doctor: true
            }
        });
        if (!history) {
            return res.status(404).json({ error: 'History not found' });
        }
        res.status(200).json(history);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const updateHistory = async (req, res) => {
    try {
        const id = req.params.id;
        const body = req.body;

        const updatedHistory = await prisma.history.update({
            where: {
                id: parseInt(id)
            },
            data: {
                diagnosis: body.diagnosis,
                treatment: body.treatment,
                visit_date: body.visit_date ? new Date(body.visit_date) : undefined,
            }
        });
        res.status(200).json(updatedHistory);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const deleteHistory = async (req, res) => {
    try {
        const id = req.params.id;
        await prisma.history.delete({
            where: {
                id: parseInt(id)
            }
        });
        res.status(204).send(); 
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export { getAllHistories,createHistory,getOneHistory,updateHistory,deleteHistory,};
