import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('开始执行数据库种子数据初始化...');

  // 1. 创建系统权限
  console.log('创建系统权限...');
  const permissions = await Promise.all([
    // 用户管理权限
    prisma.permission.upsert({
      where: { name: 'user:read' },
      update: {},
      create: {
        name: 'user:read',
        description: '查看用户信息',
        resource: 'user',
        action: 'read',
        isSystem: true,
      },
    }),
    prisma.permission.upsert({
      where: { name: 'user:write' },
      update: {},
      create: {
        name: 'user:write',
        description: '编辑用户信息',
        resource: 'user',
        action: 'write',
        isSystem: true,
      },
    }),
    prisma.permission.upsert({
      where: { name: 'user:delete' },
      update: {},
      create: {
        name: 'user:delete',
        description: '删除用户',
        resource: 'user',
        action: 'delete',
        isSystem: true,
      },
    }),
    prisma.permission.upsert({
      where: { name: 'user:admin' },
      update: {},
      create: {
        name: 'user:admin',
        description: '用户管理员权限',
        resource: 'user',
        action: 'admin',
        isSystem: true,
      },
    }),

    // 玩家管理权限
    prisma.permission.upsert({
      where: { name: 'player:read' },
      update: {},
      create: {
        name: 'player:read',
        description: '查看玩家信息',
        resource: 'player',
        action: 'read',
        isSystem: true,
      },
    }),
    prisma.permission.upsert({
      where: { name: 'player:write' },
      update: {},
      create: {
        name: 'player:write',
        description: '编辑玩家信息',
        resource: 'player',
        action: 'write',
        isSystem: true,
      },
    }),
    prisma.permission.upsert({
      where: { name: 'player:delete' },
      update: {},
      create: {
        name: 'player:delete',
        description: '删除玩家',
        resource: 'player',
        action: 'delete',
        isSystem: true,
      },
    }),
    prisma.permission.upsert({
      where: { name: 'player:admin' },
      update: {},
      create: {
        name: 'player:admin',
        description: '玩家管理员权限',
        resource: 'player',
        action: 'admin',
        isSystem: true,
      },
    }),

    // 角色权限管理
    prisma.permission.upsert({
      where: { name: 'role:read' },
      update: {},
      create: {
        name: 'role:read',
        description: '查看角色信息',
        resource: 'role',
        action: 'read',
        isSystem: true,
      },
    }),
    prisma.permission.upsert({
      where: { name: 'role:write' },
      update: {},
      create: {
        name: 'role:write',
        description: '编辑角色信息',
        resource: 'role',
        action: 'write',
        isSystem: true,
      },
    }),
    prisma.permission.upsert({
      where: { name: 'role:admin' },
      update: {},
      create: {
        name: 'role:admin',
        description: '角色管理员权限',
        resource: 'role',
        action: 'admin',
        isSystem: true,
      },
    }),
    prisma.permission.upsert({
      where: { name: 'role:delete' },
      update: {},
      create: {
        name: 'role:delete',
        description: '删除角色',
        resource: 'role',
        action: 'delete',
        isSystem: true,
      },
    }),
    prisma.permission.upsert({
      where: { name: 'role:assign' },
      update: {},
      create: {
        name: 'role:assign',
        description: '分配角色权限',
        resource: 'role',
        action: 'assign',
        isSystem: true,
      },
    }),

    // Permission 权限管理
    prisma.permission.upsert({
      where: { name: 'permission:read' },
      update: {},
      create: {
        name: 'permission:read',
        description: '查看权限信息',
        resource: 'permission',
        action: 'read',
        isSystem: true,
      },
    }),
    prisma.permission.upsert({
      where: { name: 'permission:write' },
      update: {},
      create: {
        name: 'permission:write',
        description: '编辑权限信息',
        resource: 'permission',
        action: 'write',
        isSystem: true,
      },
    }),
    prisma.permission.upsert({
      where: { name: 'permission:delete' },
      update: {},
      create: {
        name: 'permission:delete',
        description: '删除权限',
        resource: 'permission',
        action: 'delete',
        isSystem: true,
      },
    }),
    prisma.permission.upsert({
      where: { name: 'permission:admin' },
      update: {},
      create: {
        name: 'permission:admin',
        description: '权限管理员权限',
        resource: 'permission',
        action: 'admin',
        isSystem: true,
      },
    }),

    // OAuth管理权限
    prisma.permission.upsert({
      where: { name: 'oauth:read' },
      update: {},
      create: {
        name: 'oauth:read',
        description: '查看OAuth客户端',
        resource: 'oauth',
        action: 'read',
        isSystem: true,
      },
    }),
    prisma.permission.upsert({
      where: { name: 'oauth:write' },
      update: {},
      create: {
        name: 'oauth:write',
        description: '管理OAuth客户端',
        resource: 'oauth',
        action: 'write',
        isSystem: true,
      },
    }),
    prisma.permission.upsert({
      where: { name: 'oauth:admin' },
      update: {},
      create: {
        name: 'oauth:admin',
        description: 'OAuth管理员权限',
        resource: 'oauth',
        action: 'admin',
        isSystem: true,
      },
    }),

    // 系统管理权限
    prisma.permission.upsert({
      where: { name: 'system:read' },
      update: {},
      create: {
        name: 'system:read',
        description: '查看系统信息',
        resource: 'system',
        action: 'read',
        isSystem: true,
      },
    }),
    prisma.permission.upsert({
      where: { name: 'system:write' },
      update: {},
      create: {
        name: 'system:write',
        description: '修改系统配置',
        resource: 'system',
        action: 'write',
        isSystem: true,
      },
    }),
    prisma.permission.upsert({
      where: { name: 'system:admin' },
      update: {},
      create: {
        name: 'system:admin',
        description: '系统管理员权限',
        resource: 'system',
        action: 'admin',
        isSystem: true,
      },
    }),

    // 审计日志权限
    prisma.permission.upsert({
      where: { name: 'audit:read' },
      update: {},
      create: {
        name: 'audit:read',
        description: '查看审计日志',
        resource: 'audit',
        action: 'read',
        isSystem: true,
      },
    }),
  ]);

  // 2. 创建系统角色
  console.log('创建系统角色...');
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'super_admin' },
    update: {},
    create: {
      name: 'super_admin',
      description: '超级管理员',
      isSystem: true,
      priority: 100,
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: '管理员',
      isSystem: true,
      priority: 80,
    },
  });

  const moderatorRole = await prisma.role.upsert({
    where: { name: 'moderator' },
    update: {},
    create: {
      name: 'moderator',
      description: '版主',
      isSystem: true,
      priority: 60,
    },
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'user' },
    update: {},
    create: {
      name: 'user',
      description: '普通用户',
      isSystem: true,
      priority: 20,
    },
  });

  // 3. 为超级管理员分配所有权限
  console.log('分配角色权限...');
  for (const permission of permissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: superAdminRole.id,
        permissionId: permission.id,
      },
    });
  }

  // 为管理员分配基础权限（除了系统管理权限）
  const adminPermissions = permissions.filter(
    (p) => !p.name.startsWith('system:admin') && !p.name.includes(':delete'),
  );
  for (const permission of adminPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    });
  }

  // 为版主分配读取权限
  const moderatorPermissions = permissions.filter(
    (p) =>
      p.action === 'read' || (p.resource === 'player' && p.action === 'write'),
  );
  for (const permission of moderatorPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: moderatorRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: moderatorRole.id,
        permissionId: permission.id,
      },
    });
  }

  // 4. 创建默认的玩家状态
  console.log('创建玩家状态...');
  await Promise.all([
    prisma.playerStatus.upsert({
      where: { name: '正常' },
      update: {},
      create: {
        name: '正常',
        description: '正常在线状态',
        color: '#00C851',
        isDefault: true,
        isSystem: true,
        sortOrder: 1,
      },
    }),
    prisma.playerStatus.upsert({
      where: { name: '离线' },
      update: {},
      create: {
        name: '离线',
        description: '离线状态',
        color: '#6C757D',
        isSystem: true,
        sortOrder: 2,
      },
    }),
    prisma.playerStatus.upsert({
      where: { name: '暂离' },
      update: {},
      create: {
        name: '暂离',
        description: '暂时离开',
        color: '#FFB900',
        isSystem: true,
        sortOrder: 3,
      },
    }),
    prisma.playerStatus.upsert({
      where: { name: '禁言' },
      update: {},
      create: {
        name: '禁言',
        description: '被禁言状态',
        color: '#FF8800',
        isSystem: true,
        sortOrder: 4,
      },
    }),
    prisma.playerStatus.upsert({
      where: { name: '封禁' },
      update: {},
      create: {
        name: '封禁',
        description: '被封禁状态',
        color: '#DC3545',
        isSystem: true,
        sortOrder: 5,
      },
    }),
  ]);

  // 5. 创建默认的玩家类型
  console.log('创建玩家类型...');
  await Promise.all([
    prisma.playerType.upsert({
      where: { name: '普通玩家' },
      update: {},
      create: {
        name: '普通玩家',
        description: '普通游戏玩家',
        permissions: {
          canChat: true,
          canBuild: true,
          canUseItems: true,
        },
        isDefault: true,
        isSystem: true,
        sortOrder: 1,
      },
    }),
    prisma.playerType.upsert({
      where: { name: 'VIP玩家' },
      update: {},
      create: {
        name: 'VIP玩家',
        description: 'VIP特权玩家',
        permissions: {
          canChat: true,
          canBuild: true,
          canUseItems: true,
          canFly: true,
          vipKits: true,
        },
        isSystem: true,
        sortOrder: 2,
      },
    }),
    prisma.playerType.upsert({
      where: { name: '建筑师' },
      update: {},
      create: {
        name: '建筑师',
        description: '建筑师玩家',
        permissions: {
          canChat: true,
          canBuild: true,
          canUseItems: true,
          canWorldEdit: true,
          canCreative: true,
        },
        isSystem: true,
        sortOrder: 3,
      },
    }),
    prisma.playerType.upsert({
      where: { name: '管理员' },
      update: {},
      create: {
        name: '管理员',
        description: '服务器管理员',
        permissions: {
          canChat: true,
          canBuild: true,
          canUseItems: true,
          canFly: true,
          canCreative: true,
          canWorldEdit: true,
          canKick: true,
          canBan: true,
          canManagePermissions: true,
        },
        isSystem: true,
        sortOrder: 4,
      },
    }),
  ]);

  // 6. 创建默认系统配置
  console.log('创建系统配置...');
  await Promise.all([
    prisma.systemConfig.upsert({
      where: { key: 'site.name' },
      update: {},
      create: {
        key: 'site.name',
        value: 'Hydroline Services',
        category: 'general',
        isSystem: true,
        note: '网站名称',
      },
    }),
    prisma.systemConfig.upsert({
      where: { key: 'site.description' },
      update: {},
      create: {
        key: 'site.description',
        value: 'Minecraft 服务器聚合信息服务平台',
        category: 'general',
        isSystem: true,
        note: '网站描述',
      },
    }),
    prisma.systemConfig.upsert({
      where: { key: 'oauth.enabled' },
      update: {},
      create: {
        key: 'oauth.enabled',
        value: true,
        category: 'oauth',
        isSystem: true,
        note: '是否启用OAuth服务',
      },
    }),
    prisma.systemConfig.upsert({
      where: { key: 'sso.enabled' },
      update: {},
      create: {
        key: 'sso.enabled',
        value: true,
        category: 'sso',
        isSystem: true,
        note: '是否启用SSO服务',
      },
    }),
    prisma.systemConfig.upsert({
      where: { key: 'player.auto_create' },
      update: {},
      create: {
        key: 'player.auto_create',
        value: true,
        category: 'player',
        isSystem: false,
        note: '是否自动创建玩家记录',
      },
    }),
    prisma.systemConfig.upsert({
      where: { key: 'player.default_status' },
      update: {},
      create: {
        key: 'player.default_status',
        value: '正常',
        category: 'player',
        isSystem: false,
        note: '新玩家默认状态',
      },
    }),
    prisma.systemConfig.upsert({
      where: { key: 'player.default_type' },
      update: {},
      create: {
        key: 'player.default_type',
        value: '普通玩家',
        category: 'player',
        isSystem: false,
        note: '新玩家默认类型',
      },
    }),
  ]);

  // 7. 创建默认超级管理员用户（如果不存在）
  console.log('创建默认管理员用户...');
  const hashedPassword = await bcrypt.hash('admin123456', 12);

  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      id: randomUUID(),
      username: 'admin',
      email: 'admin@hydroline.local',
      password: hashedPassword,
      displayName: '系统管理员',
      bio: '系统默认管理员账户',
      isActive: true,
    },
  });

  // 分配超级管理员角色
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: superAdminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: superAdminRole.id,
    },
  });

  // 8. 创建示例OAuth客户端
  console.log('创建示例OAuth客户端...');
  await prisma.oAuthClient.upsert({
    where: { clientId: 'hydroline_wiki' },
    update: {},
    create: {
      name: 'Hydroline Wiki',
      clientId: 'hydroline_wiki',
      clientSecret: 'wiki_secret_change_in_production',
      redirectUris: ['http://wiki.hydroline.local/oauth/callback'],
      scopes: ['profile', 'email'],
      description: '官方Wiki系统OAuth客户端',
      isActive: true,
    },
  });

  console.log('数据库种子数据初始化完成！');
  console.log('默认管理员账户: admin / admin123456');
}

main()
  .catch((e) => {
    console.error('数据库种子数据初始化失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
