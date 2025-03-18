import { useAuth } from "../providers/AuthProvider";
import { Navigate } from "react-router";
import PropTypes from "prop-types";

const ProtectedComponent = ({ children, requiredPermission, redirect }) => {
  const { user } = useAuth();
  if (user.permissions.includes(requiredPermission)) {
    return <>{children}</>;
  } else if (redirect) {
    return <Navigate to={"/NotFound"} replace />;
  }
  return <></>;
};
ProtectedComponent.propTypes = {
  children: PropTypes.node.isRequired,
  requiredPermission: PropTypes.string.isRequired,
  redirect: PropTypes.bool,
};

export default ProtectedComponent;
