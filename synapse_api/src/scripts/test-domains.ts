import { AllowedDomainService } from "../modules/allowed-domain/allowed-domain.service";
import { prisma } from "../config/prisma";

async function testDomains() {
  console.log("Probando AllowedDomainService...");
  const domains = await AllowedDomainService.getAllDomains();
  console.log("Dominios cargados:", domains);

  const checkSenaUser = await AllowedDomainService.isDomainAllowed("aprendiz@soy.sena.edu.co", "USER");
  console.log("Check @soy.sena.edu.co para USER:", checkSenaUser);

  const checkGmailUser = await AllowedDomainService.isDomainAllowed("pepito@gmail.com", "USER");
  console.log("Check @gmail.com para USER:", checkGmailUser);

  const checkGmailAdmin = await AllowedDomainService.isDomainAllowed("admin@gmail.com", "ADMIN");
  console.log("Check @gmail.com para ADMIN:", checkGmailAdmin);

  const checkUnknownUser = await AllowedDomainService.isDomainAllowed("hacker@malicioso.xyz", "USER");
  console.log("Check @malicioso.xyz para USER:", checkUnknownUser);

  await prisma.$disconnect();
}

testDomains();
