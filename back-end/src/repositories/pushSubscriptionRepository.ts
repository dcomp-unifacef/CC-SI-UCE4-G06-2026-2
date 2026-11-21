import { prisma } from '../database/client'

export interface PushSubscriptionData {
  endpoint: string
  p256dh: string
  auth: string
  idAdministrador: number
}

export function findByAdministrator(idAdministrador: number) {
  return prisma.pushSubscription.findMany({
    where: { idAdministrador },
  })
}

export function save(data: PushSubscriptionData) {
  return prisma.pushSubscription.upsert({
    where: { endpoint: data.endpoint },
    create: data,
    update: {
      p256dh: data.p256dh,
      auth: data.auth,
      idAdministrador: data.idAdministrador,
    },
  })
}

export function removeByAdministratorAndEndpoint(
  idAdministrador: number,
  endpoint: string,
) {
  return prisma.pushSubscription.deleteMany({
    where: { idAdministrador, endpoint },
  })
}

export function removeByEndpoint(endpoint: string) {
  return prisma.pushSubscription.deleteMany({
    where: { endpoint },
  })
}
