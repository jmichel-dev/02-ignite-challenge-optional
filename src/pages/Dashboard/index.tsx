import { Component, useEffect, useState } from "react";

import Header from "../../components/Header";
import api from "../../services/api";
import Food from "../../components/Food";
import ModalAddFood from "../../components/ModalAddFood";
import ModalEditFood from "../../components/ModalEditFood";
import { FoodsContainer } from "./styles";

interface Food {
  id: number;
  name: string;
  description: string;
  price: string;
  available: boolean;
  image: string;
}

type FoodData = Omit<Food, "id" | "available">;

export const Dashboard: React.FC = () => {
  const [foods, setFoods] = useState<Food[]>([]);
  const [editingFood, setEditingFood] = useState({} as Food);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    const loadFoods = async () => {
      const response = await api.get<Food[]>("/foods");
      const data = response.data;

      setFoods(data);
    };

    loadFoods();
  }, []);

  const handleAddFood = async (food: FoodData) => {
    try {
      const response = await api.post<Food>("/foods", {
        ...food,
        available: true,
      });

      setFoods((currentFoods) => [...currentFoods, response.data]);
    } catch (err) {
      console.log(err);
    }
  };

  const handleUpdateFood = async (food: FoodData) => {
    try {
      const foodUpdated = await api.put(`/foods/${editingFood.id}`, {
        ...editingFood,
        ...food,
      });

      const foodsUpdated = foods.map((f) =>
        f.id !== foodUpdated.data.id ? f : foodUpdated.data
      );

      setFoods((currentFoods) => [...foodsUpdated]);
    } catch (err) {
      console.log(err);
    }
  };

  const handleDeleteFood = async (id: Number) => {
    await api.delete(`/foods/${id}`);

    setFoods((currentFoods) => {
      const foodsFiltered = currentFoods.filter((food) => food.id !== id);
      return [...foodsFiltered];
    });
  };

  const toggleModal = () => {
    setModalOpen((currentModalOpen) => !currentModalOpen);
  };

  const toggleEditModal = () => {
    setEditModalOpen((currentEditModalOpen) => !currentEditModalOpen);
  };

  const handleEditFood = (food: Food) => {
    setEditingFood(food);
    setEditModalOpen(true);
  };

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map((food) => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
            />
          ))}
      </FoodsContainer>
    </>
  );
};

export default Dashboard;
