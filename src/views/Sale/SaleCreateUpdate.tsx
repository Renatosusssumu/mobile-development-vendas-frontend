import { useEffect, useMemo, useState } from "preact/hooks";
import Button, { IconButton } from "../../components/Button";
import ComboBox from "../../components/ComboBox";
import ComboBoxOption from "../../components/ComboBox/ComboBoxOption";
import { useCompass } from "../../components/CompassNavigator";
import Icon from "../../components/Icon";
import TextField from "../../components/TextField";
import { z } from "zod";
import { Produto,Venda } from "../../api/entities";
import { produtoGetAll } from "../../api/client";

interface SaleCreateUpdateViewProps {
  seed?: Venda;
  operation: "CreateNew" | "Update";
  notifyMutated: () => void;
}

export default function SaleCreateUpdateView(props: SaleCreateUpdateViewProps) {
  const compass = useCompass();

  const [quantity, setQuantity] = useState(props.seed?.quantidade ?? 1);
  const [productId, setProductId] = useState(props.seed?.produto.id ?? 0);
  const [dateTime, setDateTime] = useState(
    props.seed?.dateTime ? new Date(props.seed.dateTime).toISOString().slice(0, -1) : ""
  );

  const validationModel = useMemo(
    () =>
      z.object({
        quantity: z
          .number({ invalid_type_error: "A quantidade precisa ser um número válido" })
          .min(1, "A quantidade deve ser pelo menos 1"),
        productId: z
          .number()
          .refine(() => true /* todo check if valid product id */, "Produto inválido"),
        dateTime: z.string().nonempty("A data e hora são obrigatórias"),
      }),
    []
  );

  const formState = {
    quantity,
    productId,
    dateTime,
  } satisfies z.infer<typeof validationModel>;

  const { error: validationError } = validationModel.safeParse(formState);

  async function handleFormSubmit(e: Event) {
    e.preventDefault();
    if (!validationError) {
      // TODO: Enviar os dados para o backend
      console.log("Dados validados:", formState);
    }
  }

  useEffect(() => {
    return () => props.notifyMutated();
  });

  const [allProducts, setAllProducts] = useState<Produto[]>([]);
  useEffect(() => {
    produtoGetAll().then((produtos) => setAllProducts(produtos));
  }, []);

  return (
    <section class="flex h-full w-full flex-col gap-2 overflow-y-scroll bg-white-0 p-4">
      <header class="flex items-center gap-2">
        <IconButton iconName="ArrowLeft" onClick={compass.pop} />
        <h1 class="font-bold">
          {props.operation === "CreateNew" ? "Cadastrar" : "Atualizar"} venda
        </h1>
      </header>
      <form onSubmit={handleFormSubmit} class="flex flex-col gap-2">
        <label class="flex flex-col">
          Quantidade
          <TextField
            kind="number"
            value={quantity}
            onInput={setQuantity}
          />
        </label>
        <label class="flex flex-col">
          Produto
          <ComboBox
            value={productId.toString()}
            onChange={(id) => setProductId(parseInt(id) || 0)}>
            {allProducts.map((product) => (
              <ComboBoxOption kind="option" value={product.id.toString()}>
                {product.nome} - {product.fabricante.nomeFantasia || product.fabricante.razaoSocial}
              </ComboBoxOption>
            ))}
          </ComboBox>
        </label>
        <label class="flex flex-col">
          Data e Hora
          <input
            type="datetime-local"
            value={dateTime}
            onInput={(e) => setDateTime((e.target as HTMLInputElement).value)}
            class="border border-gray-400 rounded p-1"
          />
        </label>
        {validationError && (
          <div>
            <p class="text-error-on-light">{validationError.errors[0].message}</p>
          </div>
        )}
        <footer class="flex justify-end">
          <Button disabled={!!validationError} onClick={handleFormSubmit}>
            <Icon name={props.operation === "CreateNew" ? "Add" : "Build"} />
            {props.operation === "CreateNew" ? "Cadastrar" : "Atualizar"}
          </Button>
        </footer>
      </form>
    </section>
  );
}
