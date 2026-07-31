import { render, screen } from "@testing-library/react";
import StyledBox from "../StyledBox";
import StyledStack from "../StyledStack";
import StyledSeparator from "../StyledSeparator";

describe("StyledBox", () => {
  it("renders its children", () => {
    render(<StyledBox>content</StyledBox>);
    expect(screen.getByText("content")).toBeInTheDocument();
  });

  it("renders header and footer around the content", () => {
    render(
      <StyledBox header={<span>head</span>} footer={<span>foot</span>}>
        body
      </StyledBox>,
    );
    expect(screen.getByText("head")).toBeInTheDocument();
    expect(screen.getByText("body")).toBeInTheDocument();
    expect(screen.getByText("foot")).toBeInTheDocument();
  });

  it("treats topPanel/bottomPanel as aliases for header/footer", () => {
    render(
      <StyledBox topPanel={<span>top</span>} bottomPanel={<span>bottom</span>}>
        body
      </StyledBox>,
    );
    expect(screen.getByText("top")).toBeInTheDocument();
    expect(screen.getByText("bottom")).toBeInTheDocument();
  });

  it("skips the side-panel grid entirely when no panels are given", () => {
    // The grid wrapper is not free — it forces three columns and a stretch
    // alignment onto content that asked for neither.
    render(<StyledBox>plain</StyledBox>);
    expect(screen.queryByTestId("styled-grid-panel")).not.toBeInTheDocument();
  });

  it("builds the side-panel grid when a panel is given", () => {
    render(<StyledBox leftPanel={<span>nav</span>}>main</StyledBox>);
    expect(screen.getByTestId("styled-grid-panel")).toBeInTheDocument();
    expect(screen.getByText("nav")).toBeInTheDocument();
    expect(screen.getByText("main")).toBeInTheDocument();
  });

  it("renders children bare under noWrap, with no scroll scaffolding", () => {
    render(<StyledBox noWrap>bare</StyledBox>);
    expect(screen.getByText("bare")).toBeInTheDocument();
    expect(screen.queryByTestId("styled-grid-panel")).not.toBeInTheDocument();
  });

  it("still honours header and footer under noWrap", () => {
    render(
      <StyledBox noWrap header={<span>h</span>} footer={<span>f</span>}>
        body
      </StyledBox>,
    );
    expect(screen.getByText("h")).toBeInTheDocument();
    expect(screen.getByText("f")).toBeInTheDocument();
    expect(screen.getByText("body")).toBeInTheDocument();
  });

  it("forwards a ref to the root element", () => {
    const ref = { current: null } as React.RefObject<HTMLDivElement | null>;
    render(<StyledBox ref={ref}>x</StyledBox>);
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });
});

describe("StyledStack", () => {
  it("stacks vertically by default", () => {
    render(
      <StyledStack>
        <span>a</span>
        <span>b</span>
      </StyledStack>,
    );
    expect(screen.getByText("a")).toBeInTheDocument();
    expect(screen.getByText("b")).toBeInTheDocument();
  });

  it("places a divider BETWEEN children, never before the first or after the last", () => {
    render(
      <StyledStack divider={<hr data-testid="divider" />}>
        <span>a</span>
        <span>b</span>
        <span>c</span>
      </StyledStack>,
    );
    // Three children means exactly two gaps.
    expect(screen.getAllByTestId("divider")).toHaveLength(2);
  });

  it("adds no divider to a single child", () => {
    render(
      <StyledStack divider={<hr data-testid="divider" />}>
        <span>only</span>
      </StyledStack>,
    );
    expect(screen.queryByTestId("divider")).not.toBeInTheDocument();
  });

  it("accepts a responsive direction without crashing", () => {
    render(
      <StyledStack direction={{ base: "column", md: "row" }}>
        <span>responsive</span>
      </StyledStack>,
    );
    expect(screen.getByText("responsive")).toBeInTheDocument();
  });
});

describe("StyledSeparator", () => {
  it("renders horizontally by default", () => {
    const { container } = render(<StyledSeparator />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("renders a vertical separator with a different class than a horizontal one", () => {
    // Asserting the recipe actually produced two distinct results — the kind of
    // check that is impossible when styled-system is mocked.
    const horizontal = render(<StyledSeparator orientation="horizontal" />);
    const vertical = render(<StyledSeparator orientation="vertical" />);
    expect((horizontal.container.firstChild as HTMLElement).className).not.toBe(
      (vertical.container.firstChild as HTMLElement).className,
    );
  });
});
