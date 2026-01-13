import Image from "next/image";
interface Pola {
  id: string;
  amount: number;
  avatar: string;
  name: string;
}
const Avatars = ({
  polapains,
}: {
  polapains: { id: string; name: string; amount: number; avatar: string }[];
}) => {
  return (
    <>
      {polapains?.map((pola, index) =>
        pola.amount > 0 ? (
          <div
            className="avatar tooltip"
            data-tip={`${pola.name}; Amount: ${pola.amount}`}
            key={pola?.id || `avatar-${index}`}
          >
            <div className="mask mask-squircle w-12">
              <Image
                src={pola?.avatar || "/avatar.jpg"}
                alt={pola.name}
                width={100}
                height={100}
              />
            </div>
          </div>
        ) : null
      )}
    </>
  );
};

export default Avatars;
