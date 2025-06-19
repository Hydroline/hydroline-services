import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // 1. 创建"全部管理"权限
  const manageAllPermission = await prisma.permission.upsert({
    where: { name: 'manage_all' },
    update: {},
    create: {
      name: 'manage_all',
      description: '全部管理权限',
      resource: '*',
      action: '*',
    },
  });

  // 2. 创建admin角色
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: { name: 'admin', description: '超级管理员' },
  });

  // 3. 绑定admin角色和全部管理权限
  await prisma.rolePermission.upsert({
    where: {
      roleId_permissionId: {
        roleId: adminRole.id,
        permissionId: manageAllPermission.id,
      },
    },
    update: {},
    create: { roleId: adminRole.id, permissionId: manageAllPermission.id },
  });

  // 4. 检查admin用户是否存在
  console.log('正在检查admin用户是否存在...');
  const adminUser = await prisma.user.findUnique({
    where: { username: 'admin' },
  });
  console.log('admin用户查找结果:', adminUser ? '找到' : '未找到');

  if (!adminUser) {
    // 5. 创建admin用户
    console.log('正在创建新的admin用户...');
    const newAdmin = await prisma.user.create({
      data: {
        username: 'admin',
        password: await bcrypt.hash('123456', 10),
        isActive: true,
      },
    });
    // 6. 绑定admin用户和admin角色
    await prisma.userRole.create({
      data: { userId: newAdmin.id, roleId: adminRole.id },
    });
    console.log('已创建admin用户和角色权限');
  } else {
    console.log('admin用户已存在，正在更新密码...');
    // 更新admin用户密码为bcrypt加密
    await prisma.user.update({
      where: { id: adminUser.id },
      data: {
        password: await bcrypt.hash('123456', 10),
      },
    });
    console.log('密码已更新为bcrypt加密格式');
    // 检查是否已绑定admin角色
    const userRole = await prisma.userRole.findFirst({
      where: { userId: adminUser.id, roleId: adminRole.id },
    });
    if (!userRole) {
      await prisma.userRole.create({
        data: { userId: adminUser.id, roleId: adminRole.id },
      });
      console.log('已绑定admin角色');
    } else {
      console.log('admin角色已绑定');
    }
    console.log('admin用户已存在，密码已更新为bcrypt加密');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
