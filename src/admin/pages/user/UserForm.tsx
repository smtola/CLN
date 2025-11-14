import CRUDForm from "../../components/CRUDForm";
import { getUserById, createUser, updateUser } from "../../services/userService";

const fields = [
  { name: "username", label: "Username" },
  { name: "email", label: "Email" },
  { name: "password", label: "Password", type: "password" },
  { name: "role", label: "Role" },
  { name: "isVerified", label: "Verified" }
];

const UserForm = () => (
  <CRUDForm
    fetchItem={getUserById}
    createItem={createUser}
    updateItem={updateUser}
    fields={fields}
    entityName="User"
  />
);

export default UserForm;
