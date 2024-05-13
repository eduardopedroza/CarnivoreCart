import { Card, CardBody, CardFooter, Image, Button } from "@nextui-org/react";
import { centsToDollars } from "../hooks/utils";

export default function SellerProductCard({ key, product, onEdit }) {
  return (
    <Card key={key}>
      <CardBody>
        <Image
          radius="lg"
          width="100%"
          src={product.imageUrl}
          className="w-full object-cover h-[140px]"
        />
      </CardBody>
      <CardFooter className="text-small justify-between">
        <div>
          <b>{product.name}</b>
          <p className="text-default-500">
            {centsToDollars(product.priceInCents)}
          </p>
        </div>
        <Button color="primary" onClick={onEdit} size="mini">
          Edit
        </Button>
      </CardFooter>
    </Card>
  );
}
