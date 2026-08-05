 
const createTimeBlockService = async (startTime, endTime) => {
    const newTimeBlock = await prisma.timeBlock.create({
        data: {
            startTime: new Date(startTime),
            endTime: new Date(endTime),
        }
    });
    return newTimeBlock
}

const listReservationService = async (req, res) =>{
    const reservation = await prisma.appointment.findMany({
        include: {
            user: true,
            timeBlock: true
        }
    })
    return reservation
}

module.exports = {createTimeBlockService, listReservationService}