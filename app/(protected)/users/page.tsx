import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreateUserForm } from "@/components/create-user-form";
import { ProfileForm } from "@/components/profile-form";
import { ChangePasswordForm } from "@/components/change-password-form";
import { Card } from "@/components/ui/card";
import { Table } from "@/components/ui/table";

export default async function UsersPage() {
  const session = await getSessionUser();
  if (!session) {
    return null;
  }

  const currentUser = await prisma.user.findUnique({ where: { id: session.id } });
  const users = session.isAdmin
    ? await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          name: true,
          email: true,
          userId: true,
          category: true,
          isAdmin: true
        }
      })
    : [];

  return (
    <>
      <Card title="Users" subtitle="Profile and password updates are available for every authenticated user." />

      <ProfileForm phone={currentUser?.phone ?? ""} />
      <ChangePasswordForm />

      {session.isAdmin ? (
        <>
          <CreateUserForm />
          <Table 
            title="All Users" 
            headers={["Name", "Email", "User ID", "Category", "Admin"]}
          >
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-3 text-sm font-medium">{user.name}</td>
                <td className="p-3 text-sm text-text/80">{user.email}</td>
                <td className="p-3 text-sm text-text/80 font-mono">{user.userId}</td>
                <td className="p-3 text-sm text-text/80">{user.category}</td>
                <td className="p-3 text-sm text-center">
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${user.isAdmin ? "bg-accent/10 text-accent" : "bg-gray-100 text-gray-500"}`}>
                    {user.isAdmin ? "Admin" : "User"}
                  </span>
                </td>
              </tr>
            ))}
          </Table>
        </>
      ) : null}
    </>
  );
}
