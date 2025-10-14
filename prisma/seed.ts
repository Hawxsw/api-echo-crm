import { PrismaClient } from '@prisma/client';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const prisma = new PrismaClient();
const scryptAsync = promisify(scrypt);

async function main() {
  console.log('🌱 Starting database seed...');

  // Create default roles
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'Super Admin' },
    update: {},
    create: {
      name: 'Super Admin',
      description: 'Acesso total ao sistema',
      isSystem: true,
      permissions: {
        create: [{ action: 'MANAGE', resource: 'ALL' }],
      },
    },
  });

  const managerRole = await prisma.role.upsert({
    where: { name: 'Gerente' },
    update: {},
    create: {
      name: 'Gerente',
      description: 'Gerencia equipes e recursos',
      isSystem: true,
      permissions: {
        create: [
          { action: 'READ', resource: 'USERS' },
          { action: 'UPDATE', resource: 'USERS' },
          { action: 'MANAGE', resource: 'KANBAN_BOARDS' },
          { action: 'MANAGE', resource: 'KANBAN_CARDS' },
          { action: 'READ', resource: 'REPORTS' },
          { action: 'MANAGE', resource: 'WHATSAPP' },
        ],
      },
    },
  });

  const employeeRole = await prisma.role.upsert({
    where: { name: 'Colaborador' },
    update: {},
    create: {
      name: 'Colaborador',
      description: 'Acesso básico ao sistema',
      isSystem: true,
      permissions: {
        create: [
          { action: 'READ', resource: 'KANBAN_BOARDS' },
          { action: 'CREATE', resource: 'KANBAN_CARDS' },
          { action: 'UPDATE', resource: 'KANBAN_CARDS' },
          { action: 'READ', resource: 'CHAT' },
          { action: 'CREATE', resource: 'CHAT' },
        ],
      },
    },
  });

  console.log('✅ Roles created: Super Admin, Gerente, Colaborador');

  // Create organizational structure
  console.log('🏢 Creating organizational structure...');

  // Departamentos principais
  const techDept = await prisma.department.create({
    data: {
      name: 'Tecnologia da Informação',
      description: 'Equipe de desenvolvimento, infraestrutura e suporte técnico',
      level: 0,
      position: 0,
      color: '#3B82F6',
      icon: 'Code',
      isActive: true,
    },
  });

  const salesDept = await prisma.department.create({
    data: {
      name: 'Comercial',
      description: 'Equipe de vendas e relacionamento com clientes',
      level: 0,
      position: 1,
      color: '#10B981',
      icon: 'TrendingUp',
      isActive: true,
    },
  });

  const financeDept = await prisma.department.create({
    data: {
      name: 'Financeiro',
      description: 'Gestão financeira e contabilidade',
      level: 0,
      position: 2,
      color: '#F59E0B',
      icon: 'DollarSign',
      isActive: true,
    },
  });

  const hrDept = await prisma.department.create({
    data: {
      name: 'Recursos Humanos',
      description: 'Gestão de pessoas e desenvolvimento organizacional',
      level: 0,
      position: 3,
      color: '#8B5CF6',
      icon: 'Users',
      isActive: true,
    },
  });

  // Subdepartamentos de TI
  const devDept = await prisma.department.create({
    data: {
      name: 'Desenvolvimento',
      description: 'Equipe de desenvolvimento de software',
      parentId: techDept.id,
      level: 1,
      position: 0,
      color: '#3B82F6',
      icon: 'Code2',
      isActive: true,
    },
  });

  const supportDept = await prisma.department.create({
    data: {
      name: 'Suporte',
      description: 'Equipe de suporte técnico',
      parentId: techDept.id,
      level: 1,
      position: 1,
      color: '#0EA5E9',
      icon: 'Headphones',
      isActive: true,
    },
  });

  const infraDept = await prisma.department.create({
    data: {
      name: 'Infraestrutura',
      description: 'Gerenciamento de servidores e redes',
      parentId: techDept.id,
      level: 1,
      position: 2,
      color: '#06B6D4',
      icon: 'Server',
      isActive: true,
    },
  });

  console.log('✅ Organizational structure created');

  // Create users
  const hashPassword = async (password: string): Promise<string> => {
    const salt = randomBytes(16).toString('hex');
    const hash = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${salt}.${hash.toString('hex')}`;
  };

  const hashedPassword = await hashPassword('senha123');

  // CEO/Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@echotech.com' },
    update: {
      firstName: 'Carlos',
      lastName: 'Silva',
      roleId: superAdminRole.id,
      position: 'CEO',
      avatar: 'https://i.pravatar.cc/150?img=1',
    },
    create: {
      email: 'admin@echotech.com',
      password: hashedPassword,
      firstName: 'Carlos',
      lastName: 'Silva',
      roleId: superAdminRole.id,
      position: 'CEO',
      avatar: 'https://i.pravatar.cc/150?img=1',
    },
  });
  
  console.log('✅ CEO created:', admin.firstName, admin.lastName, '- Position:', admin.position);

  // CTO - Chefe de TI
  const cto = await prisma.user.upsert({
    where: { email: 'cto@echotech.com' },
    update: {},
    create: {
      email: 'cto@echotech.com',
      password: hashedPassword,
      firstName: 'João',
      lastName: 'Santos',
      roleId: managerRole.id,
      departmentId: techDept.id,
      position: 'CTO - Chief Technology Officer',
      isManager: true,
      isDepartmentHead: true,
      managedDepartmentId: techDept.id,
      avatar: 'https://i.pravatar.cc/150?img=2',
    },
  });

  // Gerente de Desenvolvimento
  const devManager = await prisma.user.upsert({
    where: { email: 'dev.manager@echotech.com' },
    update: {},
    create: {
      email: 'dev.manager@echotech.com',
      password: hashedPassword,
      firstName: 'Maria',
      lastName: 'Oliveira',
      roleId: managerRole.id,
      departmentId: devDept.id,
      position: 'Gerente de Desenvolvimento',
      isManager: true,
      isDepartmentHead: true,
      managedDepartmentId: devDept.id,
      managerId: cto.id,
      avatar: 'https://i.pravatar.cc/150?img=3',
    },
  });

  // Desenvolvedores
  const dev1 = await prisma.user.upsert({
    where: { email: 'ana.dev@echotech.com' },
    update: {},
    create: {
      email: 'ana.dev@echotech.com',
      password: hashedPassword,
      firstName: 'Ana',
      lastName: 'Costa',
      roleId: employeeRole.id,
      departmentId: devDept.id,
      position: 'Desenvolvedora Full Stack',
      managerId: devManager.id,
      avatar: 'https://i.pravatar.cc/150?img=4',
    },
  });

  const dev2 = await prisma.user.upsert({
    where: { email: 'pedro.dev@echotech.com' },
    update: {},
    create: {
      email: 'pedro.dev@echotech.com',
      password: hashedPassword,
      firstName: 'Pedro',
      lastName: 'Almeida',
      roleId: employeeRole.id,
      departmentId: devDept.id,
      position: 'Desenvolvedor Backend',
      managerId: devManager.id,
      avatar: 'https://i.pravatar.cc/150?img=5',
    },
  });

  // Gerente de Suporte
  const supportManager = await prisma.user.upsert({
    where: { email: 'support.manager@echotech.com' },
    update: {},
    create: {
      email: 'support.manager@echotech.com',
      password: hashedPassword,
      firstName: 'Lucas',
      lastName: 'Ferreira',
      roleId: managerRole.id,
      departmentId: supportDept.id,
      position: 'Gerente de Suporte',
      isManager: true,
      isDepartmentHead: true,
      managedDepartmentId: supportDept.id,
      managerId: cto.id,
      avatar: 'https://i.pravatar.cc/150?img=6',
    },
  });

  // Analistas de Suporte
  const support1 = await prisma.user.upsert({
    where: { email: 'julia.support@echotech.com' },
    update: {},
    create: {
      email: 'julia.support@echotech.com',
      password: hashedPassword,
      firstName: 'Julia',
      lastName: 'Martins',
      roleId: employeeRole.id,
      departmentId: supportDept.id,
      position: 'Analista de Suporte',
      managerId: supportManager.id,
      avatar: 'https://i.pravatar.cc/150?img=7',
    },
  });

  // CFO - Chefe Financeiro
  const cfo = await prisma.user.upsert({
    where: { email: 'cfo@echotech.com' },
    update: {},
    create: {
      email: 'cfo@echotech.com',
      password: hashedPassword,
      firstName: 'Roberto',
      lastName: 'Lima',
      roleId: managerRole.id,
      departmentId: financeDept.id,
      position: 'CFO - Chief Financial Officer',
      isManager: true,
      isDepartmentHead: true,
      managedDepartmentId: financeDept.id,
      avatar: 'https://i.pravatar.cc/150?img=8',
    },
  });

  console.log('✅ Users created: 9 users with hierarchy');

  // Create Kanban Board
  const kanbanBoard = await prisma.kanbanBoard.create({
    data: {
      name: 'Desenvolvimento de Produto',
      description: 'Board para gerenciar o desenvolvimento de novos produtos',
      columns: {
        create: [
          { name: 'Backlog', position: 0, color: '#94a3b8' },
          { name: 'Em Progresso', position: 1, color: '#3b82f6' },
          { name: 'Em Revisão', position: 2, color: '#f59e0b' },
          { name: 'Concluído', position: 3, color: '#10b981' },
        ],
      },
    },
    include: { columns: true },
  });

  await prisma.kanbanCard.createMany({
    data: [
      {
        title: 'Implementar autenticação JWT',
        description: 'Criar sistema de autenticação com JWT e refresh tokens',
        columnId: kanbanBoard.columns[1]!.id,
        position: 0,
        priority: 'HIGH',
        createdById: admin.id,
        assignedToId: dev1.id,
      },
      {
        title: 'Criar dashboard administrativo',
        description: 'Dashboard com métricas e gráficos para administradores',
        columnId: kanbanBoard.columns[0]!.id,
        position: 0,
        priority: 'MEDIUM',
        createdById: devManager.id,
      },
    ],
  });

  console.log('✅ Kanban board created with sample cards');

  // Create WhatsApp conversation
  await prisma.whatsAppConversation.upsert({
    where: { clientPhone: '+5511987654321' },
    update: {},
    create: {
      clientName: 'Cliente Exemplo',
      clientPhone: '+5511987654321',
      assignedToId: support1.id,
      messages: {
        create: [
          {
            content: 'Olá, gostaria de saber mais sobre seus serviços',
            isFromClient: true,
            status: 'READ',
          },
          {
            content: 'Olá! Obrigado por entrar em contato. Como posso ajudá-lo?',
            isFromClient: false,
            status: 'READ',
          },
        ],
      },
    },
  });

  console.log('✅ WhatsApp conversation created');

  // Create group chat
  await prisma.chat.create({
    data: {
      name: 'Equipe de Desenvolvimento',
      isGroup: true,
      participants: {
        create: [
          { userId: devManager.id },
          { userId: dev1.id },
          { userId: dev2.id },
        ],
      },
      messages: {
        create: [
          {
            content: 'Bem-vindos ao grupo da equipe de desenvolvimento!',
            senderId: devManager.id,
          },
          {
            content: 'Obrigada! Feliz em fazer parte da equipe.',
            senderId: dev1.id,
          },
        ],
      },
    },
  });

  console.log('✅ Group chat created');

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📊 Estrutura Organizacional:');
  console.log('   └── Tecnologia da Informação (CTO: João Santos)');
  console.log('       ├── Desenvolvimento (Gerente: Maria Oliveira)');
  console.log('       │   ├── Ana Costa - Desenvolvedora Full Stack');
  console.log('       │   └── Pedro Almeida - Desenvolvedor Backend');
  console.log('       ├── Suporte (Gerente: Lucas Ferreira)');
  console.log('       │   └── Julia Martins - Analista de Suporte');
  console.log('       └── Infraestrutura');
  console.log('   └── Comercial');
  console.log('   └── Financeiro (CFO: Roberto Lima)');
  console.log('   └── Recursos Humanos');
  console.log('\n📝 Demo credentials:');
  console.log('   Admin: admin@echotech.com / senha123');
  console.log('   CTO: cto@echotech.com / senha123');
  console.log('   Dev Manager: dev.manager@echotech.com / senha123');
  console.log('   Developer: ana.dev@echotech.com / senha123\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
