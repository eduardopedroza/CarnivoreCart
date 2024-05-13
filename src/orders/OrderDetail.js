// import { Card, CardBody} from "@nextui-org/react";
// import UserContext from "../auth/UserContext";
// import CCApi from "../api/api";
// import { useEffect } from "react";




// export default function OrderDetail() {
//   const { currentUser } = useContext(UserContext);
//   const [orders, setOrders] = useState([]);


//   useEffect(() => {
//     getOrders();
//   });

//   const getOrders = async () => {
//     let orders = await CCApi.getOrders(currentUser.userId);
//     setOrders(orders);
//   };

//   return (
//     <div>
//       <Card>
//         <CardBody>

//         </CardBody>
//       </Card>
//     </div>
//   );
// }