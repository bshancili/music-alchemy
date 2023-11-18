import { useState, useEffect } from "react";
import { Box, Button } from "@chakra-ui/react";
import { StarIcon } from "@chakra-ui/icons";

const RatingStars = ({ onStarClick, onRateButtonClick, rating }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleStarClick = (star) => {
    onStarClick(star);
  };

  const handleRateButtonClick = () => {
    onRateButtonClick();
  };

  return (
    <Box ml={30}>
      {[...Array(10)].map((_, index) => {
        const starValue = index + 1;
        return (
          <StarIcon
            key={index}
            w={8}
            h={8}
            color={
              (hoverRating || rating) >= starValue ? "yellow.500" : "gray.300"
            }
            onMouseEnter={() => setHoverRating(starValue)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => handleStarClick(starValue)}
            cursor="pointer"
          />
        );
      })}
      <Button
        color="#fff"
        bg="yellow.500"
        _hover={{ bg: "yellow.600", transform: "scale(1.08)" }}
        size="lg"
        ml={4}
        onClick={handleRateButtonClick}
      >
        Rate
      </Button>
    </Box>
  );
};

export default RatingStars;
