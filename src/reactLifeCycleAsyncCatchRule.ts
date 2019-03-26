import * as Lint from "tslint";
import * as ts from "typescript";

const ASYNC_LIFECYCLE_METHODS = ["componentWillMount", "componentDidMount", "componentWillReceiveProps", "shouldComponentUpdate", "componentWillUpdate", "componentDidUpdate", "componentWillUnmount"];

export class Rule extends Lint.Rules.AbstractRule {
    public static FAILURE_STRING = "async methods should be encapsulated in try - catch statements";

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new ReactLifeCycleAsyncCatchWalker(sourceFile, this.getOptions()));
    }
}

class ReactLifeCycleAsyncCatchWalker extends Lint.RuleWalker {

  public visitMethodDeclaration(node: ts.MethodDeclaration) {
    if (ASYNC_LIFECYCLE_METHODS.indexOf(node.name.getText()) == -1) {
      return;
    }
  
    if (!node.modifiers) {
      return;
    }

    const modifiers: ts.ModifiersArray = node.modifiers;
    const async = modifiers.filter((modifier) => {
      return modifier.kind == ts.SyntaxKind.AsyncKeyword;
    }).length > 0;

    if (async && node.body && node.body.statements && node.body.statements.length) { 
      const statements = node.body.statements;
      const firstStatement = statements[0];
      const lastStatement = statements[statements.length - 1];

      if (firstStatement.kind != ts.SyntaxKind.TryStatement || lastStatement.end != firstStatement.end) {
        this.addFailure(this.createFailure(node.getStart(), node.getWidth(), Rule.FAILURE_STRING));
      }
    }

  }

}