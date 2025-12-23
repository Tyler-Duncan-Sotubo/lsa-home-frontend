import { Button } from "@/shared/ui/button";
import Image from "next/image";
import React from "react";

const SerenePromo = () => {
  return (
    <section className="w-[95%] mx-auto md:py-8 py-2 flex flex-col items-start md:gap-6 gap-2 mt-10 md:mt-4 md:flex-row">
      <section className="space-y-5 md:w-[45%] flex flex-col justify-center">
        <h3 className="font-thin">SERENE HOSPITALITY</h3>
        <h4 className="text-3xl text-primary-foreground">
          Hospitality Linens and Amenities
        </h4>
        <p className="max-w-lg">
          We provide well made products for hotels, short lets and all
          commercial accommodations with great pricing and customization
          options.
        </p>
        <Button className="h-14 rounded-md w-1/2">
          Explore Serene Hospitality
        </Button>
      </section>
      <section className="md:w-[55%] w-full h-[500px] relative">
        <Image
          src="https://centa-hr.s3.amazonaws.com/019b40f4-a8f1-7b26-84d0-45069767fa8c/019b480f-314f-77db-a221-bfb51eb897b6-1766442852452.jpg"
          alt="Serene Hospitality Promo"
          fill
          className="w-full h-auto object-cover"
        />
      </section>
    </section>
  );
};

export default SerenePromo;
