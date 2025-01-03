const Hero = () => {
  return (
    <div
      className="hero h-72 sm:h-96 md:h-[500px]"
      style={{
        backgroundImage:
          "url(https://i.ibb.co.com/HnmfKMd/PXL-20241204-062046799-PORTRAIT.jpg)",
      }}
    >
      <div className="hero-overlay bg-opacity-60"></div>
      <div className="hero-content text-neutral-content text-center">
        <div className="max-w-md">
          <h1 className="mb-5 text-5xl font-bold">Control Room</h1>
          <p className="mb-5">
            Jani na ki dimu. Bishal kicu ekta deya lagbo bani te Mozammel
          </p>
        </div>
      </div>
    </div>
  );
};

export default Hero;
