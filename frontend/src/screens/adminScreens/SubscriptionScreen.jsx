import React, { useState, useEffect } from "react";
import { Form, Button, Table } from "react-bootstrap";
import FormContainer from "../../components/FormContainer";
import { toast } from "react-toastify";
import {
  useAddSubMutation,
  useGetAllAdminSubscriptionMutation,
  useDeleteSubscriptionMutation,
  useUpdateSubPriceMutation, // Ajout de la mutation
} from "../../slices/adminApiSlice";

const SubscriptionScreen = () => {
  // États pour le formulaire
  const [name, setName] = useState("");
  const [timeValue, setTimeValue] = useState(0);
  const [timeUnit, setTimeUnit] = useState("Day");
  const [time, setTime] = useState("");
  const [price, setPrice] = useState(0);

  // États pour les abonnements
  const [allSubscriptions, setAllSubscriptions] = useState([]);
  const [updatedPrice, setUpdatedPrice] = useState({}); // Nouvel état pour gérer le prix temporaire

  // Mutations API
  const [getAllSub] = useGetAllAdminSubscriptionMutation();
  const [addSub] = useAddSubMutation();
  const [deleteSubscription] = useDeleteSubscriptionMutation();
  const [updatePrice] = useUpdateSubPriceMutation(); // Mutation pour l'update du prix

  // Récupération des abonnements
  const fetchAllSubscriptions = async () => {
    try {
      const result = await getAllSub().unwrap();
      setAllSubscriptions(result.sub);
    } catch (err) {
      toast.error("Erreur lors de la récupération des abonnements.");
    }
  };

  useEffect(() => {
    setTime(`${timeValue}${timeUnit}`);
    fetchAllSubscriptions();
  }, [timeValue, timeUnit]);

  // Gestion de la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || timeValue <= 0 || price <= 0) {
      toast.error("Veuillez remplir tous les champs correctement.");
      return;
    }

    try {
      await addSub({ name, time, price }).unwrap();
      toast.success("Abonnement ajouté avec succès !");
      setName("");
      setTimeValue(0);
      setTimeUnit("Day");
      setPrice(0);
      fetchAllSubscriptions(); // Actualiser la liste
    } catch (err) {
      toast.error(err?.data?.errors[0]?.message || err?.error);
    }
  };

  // Gestion de la suppression d'un abonnement
  const handleDelete = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer cet abonnement ?" + id)) {
      try {
        await deleteSubscription({ id }).unwrap();
        toast.success("Abonnement supprimé avec succès !");
        fetchAllSubscriptions();
      } catch (err) {
        toast.error("Erreur lors de la suppression.");
      }
    }
  };

  // Gestion de la mise à jour du prix
  const handlePriceChange = (id, newPrice) => {
    setUpdatedPrice({ ...updatedPrice, [id]: newPrice });
  };

  const handleUpdatePrice = async (id) => {
    const newPrice = updatedPrice[id];
    if (!newPrice || newPrice <= 0) {
      toast.error("Le prix doit être valide.");
      return;
    }

    try {
      await updatePrice({ id, price: newPrice }).unwrap();
      toast.success("Prix mis à jour avec succès !");
      fetchAllSubscriptions(); // Actualiser la liste
    } catch (err) {
      toast.error("Erreur lors de la mise à jour du prix.");
    }
  };

  return (
    <FormContainer>
      <h1>Créer un Abonnement</h1>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="subscriptionName">
          <Form.Label>Nom de l'abonnement</Form.Label>
          <Form.Control
            type="text"
            placeholder="Entrez le nom de l'abonnement"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="time">
          <Form.Label>Durée</Form.Label>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <Form.Control
              type="number"
              placeholder="Entrez la durée"
              value={timeValue}
              onChange={(e) => setTimeValue(Number(e.target.value))}
            />
            <Form.Select
              value={timeUnit}
              onChange={(e) => setTimeUnit(e.target.value)}
            >
              <option value="Day">Day</option>
              <option value="Month">Month</option>
              <option value="Year">Year</option>
            </Form.Select>
          </div>
        </Form.Group>

        <Form.Group controlId="price">
          <Form.Label>Prix (en EUR)</Form.Label>
          <Form.Control
            type="number"
            placeholder="Entrez le prix en euros"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
          />
        </Form.Group>

        <Button type="submit" variant="primary" className="mt-3">
          Soumettre
        </Button>
      </Form>

      {/* Table pour afficher les abonnements */}
      <h2 className="mt-5">Liste des Abonnements</h2>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Nom</th>
            <th>Durée</th>
            <th>Prix</th>
            <th>Update</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {allSubscriptions.length > 0 ? (
            allSubscriptions.map((subscription, index) => (
              <tr key={subscription._id}>
                <td>{index + 1}</td>
                <td>{subscription.name}</td>
                <td>{subscription.time}</td>
                <td>
                  <Form.Control
                    type="number"
                    value={updatedPrice[subscription._id] || subscription.price}
                    onChange={(e) =>
                      handlePriceChange(subscription._id, Number(e.target.value))
                    }
                    style={{ width: "80px" }}
                  />
                  €
                </td>
                <td>
                  <Button
                    variant="warning"
                    size="sm"
                    onClick={() => handleUpdatePrice(subscription._id)}
                  >
                    Update
                  </Button>
                </td>
                <td>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(subscription._id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center">
                Aucun abonnement disponible.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </FormContainer>
  );
};

export default SubscriptionScreen;
