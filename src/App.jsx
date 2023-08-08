import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCartShopping,
  faHamburger,
  faPlus,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

const App = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [totalPayment, setTotalPayment] = useState(totalPrice);
  const [currentVoucher, setCurrentVoucher] = useState("");
  const [currentOrderId, setCurrentOrderId] = useState();
  const [isShowOrder, setIsShowOrder] = useState(false);
  const [isCheckout, setIsCheckout] = useState(false);

  useEffect(() => {
    fetch("https://tes-mobile.landa.id/api/menus")
      .then((response) => response.json())
      .then((result) => setProducts(result.datas))
      .catch((error) => console.log(error));
  }, []);

  useEffect(() => {
    const paymentAfterDiscount = totalPrice - discount;
    if (paymentAfterDiscount <= 0) {
      setTotalPayment(0);
    } else {
      setTotalPayment(paymentAfterDiscount);
    }
  }, [totalPrice, discount]);

  const addOrders = (item) => {
    const order = {
      id: item.id,
      nama: item.nama,
      harga: item.harga,
      gambar: item.gambar,
      catatan: "",
      qty: 1,
    };
    setTotalPrice(totalPrice + item.harga);
    const existingOrder = orders.find((order) => order.id === item.id);
    if (existingOrder) {
      const updatedOrders = orders.map((order) =>
        order.id === item.id ? { ...order, qty: order.qty + 1 } : order
      );
      setOrders(updatedOrders);
    } else {
      setOrders([...orders, order]);
    }
  };

  const handleDiscount = (event) => {
    const { value } = event.target;
    setCurrentVoucher(value);
    fetch(`https://tes-mobile.landa.id/api/vouchers?kode=${value}`)
      .then((response) => response.json())
      .then((result) => setDiscount(result.datas.nominal));
  };

  const handleNoteChange = (productId, note) => {
    setOrders((prevOrder) => {
      return prevOrder.map((product) => {
        if (product.id === productId) {
          return { ...product, catatan: note };
        }
        return product;
      });
    });
  };

  const handleCheckout = () => {
    fetch("https://tes-mobile.landa.id/api/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nominal_diskon: discount,
        nominal_pesanan: totalPayment,
        items: orders,
      }),
    })
      .then((response) => response.json())
      .then((result) => {
        setCurrentOrderId(result.id);
        // console.log(result);
      });
    setIsCheckout(!isCheckout);
    setIsShowOrder(!isShowOrder);
    setOrders([]);
    setCurrentVoucher("");
    setDiscount(0);
    setTotalPrice(0);
  };

  const handleCanceledOrder = () => {
    fetch(`https://tes-mobile.landa.id/api/order/cancel/${currentOrderId}`, {
      method: "POST",
    })
      .then((response) => response.json())
      .then((result) => {
        alert(result.message);
        // console.log(result);
      });
    setIsCheckout(!isCheckout);
  };

  return (
    <div className="w-full min-h-screen bg-white">
      {isCheckout && (
        <div className="toast toast-end">
          <div className="alert alert-success flex justify-center">
            <span>Pesanan Berhasil dibuat</span>
            <button className="btn bg-teal-400" onClick={handleCanceledOrder}>
              Batal Pesanan
            </button>
            <span
              className="cursor-pointer"
              onClick={() => setIsCheckout(!isCheckout)}
            >
              <FontAwesomeIcon icon={faXmark} />
            </span>
          </div>
        </div>
      )}
      <div className="navbar bg-teal-400 text-white px-20">
        <div className="flex-1">
          <a className="cursor-pointer normal-case text-2xl font-bold">
            <FontAwesomeIcon icon={faHamburger} className="text-3xl me-1" />
            BeliJajan
          </a>
        </div>
        <div className="flex-none">
          <ul className="menu menu-horizontal px-1 text-xl font-semibold capitalize">
            <li>
              <a onClick={() => setIsShowOrder(!isShowOrder)}>
                <FontAwesomeIcon icon={faCartShopping} />
                keranjang
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-12 p-20 gap-4">
        {products.map((value, index) => {
          return (
            <div
              className="col-span-1 md:col-span-3 p-4 rounded-lg"
              key={index}
            >
              <div className="card w-80 h-[26rem] bg-base-100 shadow-xl">
                <figure className="p-6">
                  <img src={value.gambar} alt={value.gambar} height="300" />
                </figure>
                <div className="card-body">
                  <h2 className="card-title text-2xl text-teal-400 font-semibold">
                    {value.nama}
                  </h2>
                  <p className="text-xl font-medium">
                    Rp.{value.harga.toLocaleString()}
                  </p>
                  <button
                    className="btn bg-teal-400 text-white font-semibold mt-6"
                    onClick={() => addOrders(value)}
                  >
                    <FontAwesomeIcon icon={faPlus} />
                    beli sekarang
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {isShowOrder ? (
        <div className="absolute w-full min-h-screen bg-slate-500/50 top-0 left-0 flex justify-end">
          <div className="w-[40rem] min-h-screen bg-white">
            <div className="navbar bg-teal-400 text-white px-8">
              <div className="flex-1">
                <a className="cursor-pointer normal-case text-2xl font-bold">
                  <FontAwesomeIcon
                    icon={faHamburger}
                    className="text-3xl me-1"
                  />
                  BeliJajan
                </a>
              </div>
              <div className="flex-none">
                <ul className="menu menu-horizontal px-1 text-3xl font-semibold capitalize">
                  <li>
                    <a onClick={() => setIsShowOrder(!isShowOrder)}>
                      <FontAwesomeIcon icon={faXmark} />
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            {orders.length > 0 ? (
              <div className="px-10">
                {orders.map((product, index) => {
                  return (
                    <div
                      className="w-full py-4 flex flex-col gap-4 bg-white  rounded-lg mb-3"
                      key={index}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex gap-6">
                          <img
                            src={product.gambar}
                            alt={product.gambar}
                            width="60"
                            height="60"
                            className="oveflow-hidden"
                          />
                          <div className="flex justify-center flex-col">
                            <h1 className="text-xl text-teal-400">
                              {product.nama}
                            </h1>
                            <p>Rp.{product.harga.toLocaleString()}</p>
                          </div>
                        </div>
                        <p>x {product.qty}</p>
                      </div>
                      <input
                        type="text"
                        name={product.nama}
                        placeholder={`Catatan untuk ${product.nama}`}
                        className="input input-bordered w-full"
                        onChange={(e) =>
                          handleNoteChange(product.id, e.target.value)
                        }
                      />
                    </div>
                  );
                })}
                <select
                  className="select select-bordered w-full mb-3 capitalize"
                  onChange={handleDiscount}
                >
                  <option selected disabled>
                    gunakan voucher?
                  </option>
                  <option selected={currentVoucher === "hemat"} value="hemat">
                    hemat
                  </option>
                  <option selected={currentVoucher === "puas"} value="puas">
                    puas
                  </option>
                </select>
                <div className="flex justify-between mb-3">
                  <p>Total Harga</p>
                  <p>{totalPrice.toLocaleString()}</p>
                </div>
                <div className="flex justify-between mb-3">
                  <p>Total diskon</p>
                  <p>{discount.toLocaleString()}</p>
                </div>
                <hr className="h-1 bg-teal-400" />
                <div className="flex justify-between my-3">
                  <p>Total Pembayaran</p>
                  <p>{totalPayment.toLocaleString()}</p>
                </div>
                <button
                  className="btn bg-teal-400 w-full mb-12"
                  onClick={handleCheckout}
                >
                  Bayar Rp {totalPayment.toLocaleString()}
                </button>
              </div>
            ) : (
              <h1 className="text-center py-10">Belum ada pesanan</h1>
            )}
          </div>
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default App;
