const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    // Crear usuarios
    const hashedPassword1 = await bcrypt.hash('password123', 10);
    const hashedPassword2 = await bcrypt.hash('password456', 10);

    const user1 = await prisma.user.create({
        data: {
            name: 'Nathaly Rojas',
            email: 'nathaly@example.com',
            password: hashedPassword1,
            role: 'USER',
        },
    });

    const user2 = await prisma.user.create({
        data: {
            name: 'Sofia Admin',
            email: 'sofia.admin@example.com',
            password: hashedPassword2,
            role: 'ADMIN',
        },
    });

    // Crear bloques de horario
    const timeBlock1 = await prisma.timeBlock.create({
        data: {
            startTime: new Date('2023-10-01T09:00:00Z'),
            endTime: new Date('2023-10-01T10:00:00Z'),
        },
    });

    const timeBlock2 = await prisma.timeBlock.create({
        data: {
            startTime: new Date('2023-10-01T10:00:00Z'),
            endTime: new Date('2023-10-01T11:00:00Z'),
        },
    });

    // Crear citas
    await prisma.appointment.create({
        data: {
            date: new Date('2023-10-01T09:00:00Z'),
            user: { connect: { id: user1.id } },
            timeBlock: { connect: { id: timeBlock1.id } },
        },
    });

    await prisma.appointment.create({
        data: {
            date: new Date('2023-10-01T10:00:00Z'),
            user: { connect: { id: user2.id } },
            timeBlock: { connect: { id: timeBlock2.id } },
        },
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });