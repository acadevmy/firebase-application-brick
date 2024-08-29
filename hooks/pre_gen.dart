import 'dart:async';
import 'dart:io';

import 'package:mason/mason.dart';

import 'constants.dart';
import 'vault.dart';

Future<void> run(HookContext context) async {
  final token = runFirebaseLogin(context);

  final projects = await runFirebaseProjectList(context, token);

  final envinroments = <String, String>{
    'development': chooseProject(
          context: context,
          env: 'development',
          projects: projects,
        )?.id ??
        '',
    'staging': chooseProject(
          context: context,
          env: 'staging',
          projects: projects,
        )?.id ??
        '',
    'production': chooseProject(
          context: context,
          env: 'production',
          projects: projects,
        )?.id ??
        '',
  };

  context.vars.putIfAbsent('firebaseEnvinroments', () => envinroments);

  if (envinroments.values.any((project) => project.isEmpty)) {
    context.logger.alert(
      'Remember to modify the .firebaserc file for the unconfigured environments.',
    );
  }

  final String applicationName = context.vars[kApplicationNameKey];
  final vault = Vault(Directory.current.parent.parent);
  final vaultFirebaseTokenKey = '${applicationName.constantCase}_FIREBASE_TOKEN';

  ['staging', 'production'].forEach((environment) {
    vault.pull(environment);
    vault.addVariable(environment, vaultFirebaseTokenKey, token);
    vault.push(environment);
    context.logger.info('🔐 Stored $vaultFirebaseTokenKey for .env.vault $environment');
  });

  context.logger.success('Firebase configured successfully 🚀');
}

Future<List<Project>> runFirebaseProjectList(HookContext context, String token) async {
  await runFirebaseLogin(context);

  final projectsTableResult = await Process.run(
    'pnpm',
    ['dlx', 'firebase-tools', 'projects:list', '--token', token],
  );

  final projectsTable = projectsTableResult.stdout.toString();

  return parseProjects(projectsTable);
}

String runFirebaseLogin(HookContext context) {
  context.logger.info('🔑 Logging in Firebase tools...');
  final processResult = Process.runSync(
    'pnpm',
    ['dlx', 'firebase-tools', 'login:ci'],
    runInShell: true,
  );

  if (processResult.exitCode > 0) {
    throw Exception(processResult.stderr?.toString()??'');
  }

  final response = processResult.stdout.toString();

  return extractFirebaseToken(response);


}

/// This method extracts the Firebase CI token from the output of the `firebase login:ci` command.
/// It uses a regular expression (RegExp) to identify a plausible token, which is typically a long
/// alphanumeric string without spaces. The token can appear anywhere in the output, even as part of a sentence.
/// - The RegExp looks for a string that is sufficiently long and consists of alphanumeric characters, dashes, or underscores.
/// - The method ensures that URLs are not mistakenly identified as tokens by excluding common URL patterns.
///
/// If a valid token is found, it is returned; otherwise, the method throws an exception.
String extractFirebaseToken(String commandOutput) {
  final tokenPattern = RegExp(r'''\b[^\s]{40,}\b''', multiLine: true);

  final matches = tokenPattern.allMatches(commandOutput);

  for (final match in matches) {
    final token = match.group(0);

    if (token != null && !token.startsWith('http://') && !token.startsWith('https://')) {
      return token; // Return the valid token
    }
  }

  // If no valid token is found, throw an exception
  throw Exception("Token not found in the output.");
}

List<Project> parseProjects(String table) {
  List<Project> projects = [];
  List<String> lines = table.split('\n');

  // Trova le righe con i dati
  for (var line in lines) {
    if (line.contains('│')) {
      List<String> columns = line.split('│').map((col) => col.trim()).toList();
      if (columns.length > 2 && columns[1] != 'Project Display Name') {
        String projectDisplayName = columns[1];
        String projectId = columns[2]
            .replaceAll(' (current)', ''); // Rimuove "(current)" se presente
        projects.add(Project(projectDisplayName, projectId));
      }
    }
  }

  return projects;
}

Project? chooseProject({
  required HookContext context,
  required String env,
  required List<Project> projects,
}) {
  final projectsWithEmptyProject = [...projects, Project('Choose later', '')];

  final choosed = context.logger.chooseOne<Project>(
    "Choose project for $env",
    choices: projectsWithEmptyProject,
    display: (choice) => choice.displayName,
  );

  if (choosed.id.trim().isEmpty) {
    return null;
  }

  return choosed;
}

class Project {
  final String displayName;
  final String id;

  Project(this.displayName, this.id);

  @override
  String toString() => 'Project Display Name: $displayName, Project ID: $id';
}
