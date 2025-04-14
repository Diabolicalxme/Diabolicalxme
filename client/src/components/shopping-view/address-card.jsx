import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Label } from "../ui/label";

function AddressCard({
  addressInfo,
  handleDeleteAddress,
  handleEditAddress,
  setCurrentSelectedAddress,
  selectedId,
}) {
  return (
    <Card
      onClick={
        setCurrentSelectedAddress
          ? () => setCurrentSelectedAddress(addressInfo)
          : null
      }
      className={`cursor-pointer ${
        selectedId?._id === addressInfo?._id
          ? "border-primary border-[4px]"
          : "border border-input"
      } bg-card text-card-foreground hover:shadow-md transition-shadow duration-300`}
    >
      <CardContent className="grid p-4 gap-4">
        <Label className="text-foreground">Address: <span className="text-muted-foreground">{addressInfo?.address}</span></Label>
        <Label className="text-foreground">City: <span className="text-muted-foreground">{addressInfo?.city}</span></Label>
        <Label className="text-foreground">Pincode: <span className="text-muted-foreground">{addressInfo?.pincode}</span></Label>
        <Label className="text-foreground">Phone: <span className="text-muted-foreground">{addressInfo?.phone}</span></Label>
        <Label className="text-foreground">Notes: <span className="text-muted-foreground">{addressInfo?.notes || 'None'}</span></Label>
      </CardContent>
      <CardFooter className="p-3 flex justify-between">
        <Button
          onClick={() => handleEditAddress(addressInfo)}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Edit
        </Button>
        <Button
          onClick={() => handleDeleteAddress(addressInfo)}
          variant="outline"
          className="border-input hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
        >
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}

export default AddressCard;
