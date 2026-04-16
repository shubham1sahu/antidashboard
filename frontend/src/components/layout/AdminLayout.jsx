import React from "react";

const AdminLayout = ({ children }) => {
  return (
    <div>
      <h2>Admin Panel</h2>
      <div>{children}</div>
    </div>
  );
};

export default AdminLayout;