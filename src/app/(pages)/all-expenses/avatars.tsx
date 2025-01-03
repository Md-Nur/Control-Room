import Image from "next/image";
interface Pola {
  id: string;
  amount: number;
  avatar: string;
  name: string;
}
const Avatars = ({ polapains }: { polapains: Pola[] }) => {
  return (
    <>
      {polapains.map(
        (pola: Pola) =>
          pola.amount > 0 && (
            <div
              className="avatar tooltip"
              data-tip={`Name: ${pola.name}; Amount: ${pola.amount}`}
              key={pola?.id || Math.random()}
            >
              <div className="mask mask-squircle w-12">
                <Image
                  src={pola?.avatar || "/avatar.jpg"}
                  alt={pola?.name || "jani na"}
                  width={100}
                  height={100}
                />
              </div>
            </div>
          )
      )}
    </>
  );
};

export default Avatars;
